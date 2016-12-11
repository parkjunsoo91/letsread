import os
import sqlite3
import json
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, jsonify
# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)


# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'letsread.db'),
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='1234'
))
app.config.from_envvar('LETSREAD_SETTINGS', silent=True)

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def insert(table, fields=(), values=()):
    # g.db is the database connection
    db = get.db()
    cur = db.cursor()
    query = 'INSERT INTO %s (%s) VALUES (%s)' % (
        table,
        ', '.join(fields),
        ', '.join(['?'] * len(values))
    )
    cur.execute(query, values)
    db.commit()
    id = cur.lastrowid
    cur.close()
    return id

@app.cli.command('initdb')
def initdb_command():
    """Initializes the database."""
    init_db()
    print 'Initialized the database.'

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/')
def root():
    return redirect(url_for('view'))

@app.route('/view')
def view():
    name = None
    if session.get('id'):
        user = query_db('select * from users where id = ?', [session['id']], one=True)
        name = user['username']
    return render_template('view.html', name=name)

@app.route('/login', methods=['POST'])
def login():
    error = None
    the_username = request.form['username']
    user = query_db('select * from users where username = ?', [the_username], one=True)
    if user is None:
        print 'No such user... adding the user'
        db = get_db()
        db.execute('insert into users (username) values (?)', [the_username])
        db.commit()
        
        user = query_db('select * from users where username = ?', [the_username], one=True)
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT,'templates', 'TotalHighlight.json')
        f = open(json_url)
        jsonstring=""
        for l in f:
            jsonstring = jsonstring + l.strip()
        f.close()
        db.execute('insert into highlights (uid, pid, json) values (?,?,?)', [user['id'], 1, jsonstring])
        db.commit()
        

    print the_username, 'has the id', user['id']

    session['id'] = user['id']
    session['username'] = user['username']
    return redirect(url_for('view'))

@app.route('/logout')
def logout():
    session.pop('id', None)
    session.pop('username', None)
    return redirect(url_for('view'))


#client sends highlight request in AJAX.
#server responds with the same data.
@app.route('/updateHighlight', methods=['POST'])
def highlight():
    if not session.get('id'):
        return jsonify(ok = False)
    uid = session['id']
    high = request.form.get('content')
    db = get_db()
    db.execute('update highlights set json = ? where uid = ?', [high, uid])
    db.commit()
    return jsonify(ok = True)

#load all highlights when session page loads.
@app.route('/loadHighlight', methods=['POST'])
def loadHighlights():
    uid = 0
    if session.get('id'):
        uid = session['id']
    pid = 1
    total = int(request.form.get('total'))
    layer = request.form.get('layer')
    if layer:
        layer = int(layer)
    print "uid: %d, pid: %d, total %d" % (uid, pid, total)
    if total == 1:
        if layer:
            highlights = query_db('select * from highlights where pid=? and layer=?', [pid, layer], one=False)
        else:
            highlights = query_db('select * from highlights where pid=?', [pid], one=False)
        if not highlights:
            return jsonify(ok = False, content = None)
        obj = RowsToObj(highlights)
        return jsonify(ok = True, content = obj)
    else:
        if layer:
            highlights = query_db('select * from highlights where pid=? and uid=? and layer=?', [pid, uid, layer], one=True)
        else:
            highlights = query_db('select * from highlights where pid=? and uid=?', [pid, uid], one=True)
        if not highlights:
            return jsonify(ok = False, content = None)        
        return jsonify(ok = True, content = json.loads(highlights['json']))

#function that aggregates multiple overlapping highlight data into one weighted highlight data
#each row is a user highlight about a document on a particular layer.
#all rows are about the same layer.
def RowsToObj(rows, uid = 0):
    HO = {}
    FO = {}
    initFOHO(FO, rows)
    fillFO(FO, rows, uid)
    FrequencyToHighlight(FO, HO)
    return HO

def initFOHO(frequencyObj, rows):
    obj = json.loads(rows[0]['json'])
    for paragId in obj:
        frequencyObj[paragId] = {'head': 0, 'tail': 0}
        head = 65000
        tail = 0
        for hl in obj[paragId]:
            tail = max(hl['end'], tail)
            head = min(hl['start'], head)
        frequencyObj[paragId]['histogram'] = [0] * tail
        frequencyObj[paragId]['head'] = head
        frequencyObj[paragId]['tail'] = tail


def fillFO(frequencyObj, rows, uid = 0):
    for row in rows:
        if uid != 0 and row['uid'] != uid:
            continue
        obj = json.loads(row['json'])
        for paragId in obj:
            for hl in obj[paragId]:
                for i in range(hl['start'], hl['end']):
                    frequencyObj[paragId]['histogram'][i] += 1

def FrequencyToHighlight(FO, HO):
    for paragId in FO:
        HO[paragId] = []
        hist = FO[paragId]['histogram']
        head = FO[paragId]['head']
        tail = FO[paragId]['tail']
        print "head: %d, tail: %d" % (head, tail)
        thresh = max(hist) / 3
        start = 0
        value = 0
        for i in range(len(hist)):
            if hist[i] <= thresh:
                if value > thresh:
                    HO[paragId].append({'start': start, 'end': i})
            else:
                if value <= thresh:
                    start = i
                if i == len(hist) - 1:
                    HO[paragId].append({'start': start, 'end': i + 1})
            value = hist[i]

        if len(HO[paragId]) == 0 or HO[paragId][0]['start'] > head:
            HO[paragId].insert(0, {'start': head, 'end': head})
        if HO[paragId][-1]['end'] < tail:
            HO[paragId].append({'start': tail, 'end': tail})
