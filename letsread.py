import os
import sqlite3
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
        '''
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
        '''

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
    total = request.form.get('total')
    print "uid is " + str(uid)
    print "pid is " + str(pid)
    print "total is " + str(total)
    if total == 1:
        highlights = query_db('select * from highlights where pid=?', [pid], one=False)
        if not highlights:
            return jsonify(ok = False, content = None)
        #TODO: combine all highlight data and send the bunch.
        aggregateJsonObject = aggregate(highlights)
        return jsonify(ok = True, content = jsonify(aggregateJsonObject))
    else:
        highlights = query_db('select * from highlights where pid=? and uid=?', [pid, uid], one=True)
        if not highlights:
            #should be unlogged in person
            return jsonify(ok = False, content = None)
        aggregate([highlights])
        return jsonify(ok = True, content = highlights['json'])


#highlightlist is a list of db entries retrieved. each entry is all highlights of a single user.
#returns aggregateObject, which is totalDict.
def aggregate(highlightList):
    totalDict = {}
    for paragId, highList in highlightList[0]
    for entry in highlightList:        #for every user
        print(entry['json'])
        paragLength = 0
        for paragId, highList in entry:     #for every paragraph
            #get paragraph length
            for high in highList:
                paragLength = max(high['end'], paraglength)
            paragChars = [0] * paragLength

            #fill array paragChars with highlight occurence
            for high in highList:
                for i in range(high['start'], high['end']):
                    paragChars[i] += 1

            #proces paragChars into paragHighlightList
            newHighList = []
            val = 0
            newHigh = {}
            for i in range(len(paragChars)):
                if val == paragChars[i]:
                    continue
                elif val == 0 and paragChars[i] != 0:
                    #start new highlight
                    newHigh[start] = i
                elif val != 0 and paragChars[i] == 0:
                    #end highlight
                    newHigh[end] = i-1
                    newHighList.append(newHigh)
                    newHigh = {}
                else:
                    #end and start highlight
                    newHigh[end] = i-1
                    newHighList.append(newHigh)
                    newHigh = {}
                    newHigh[start] = i
                val = paragChars[i]
                #if unfinished highlight exists, finish it.
            if val != 0:
                newHigh[end] = len(paragChars) - 1
                newHighList.append(newHigh)
            #now we got the newHighList, add it to totalDict




                



            for highlight in highList:
                pass
    totalJsonObject = json.dumps(totalDict)
    return totalJsonObject
