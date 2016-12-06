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
        user = query_db('select * from users where username = ?', [the_username], one=True)
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(SITE_ROOT,'templates', 'TotalHighlight.json')
        f = open(json_url)
        jsonstring=""
        for l in f:
            jsonstring = jsonstring + l.strip()
        f.close()
        db.execute('insert into highlights (uid, pid, json) values (?,?,?)', [user['id'], 1, jsonstring])

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
    high = request.args.get('dochigh')
    db = get_db()
    db.execute('update highlights set json = () where uid = ()', [high, uid])
    db.commit()
    return jsonify(ok = True)

#load all highlights when session page loads.
@app.route('/loadHighlight', methods=['POST'])
def loadHighlights():
    uid = session['id']
    pid = 1
    total = request.args.get('total')
    print "uid is " + uid
    print "pid is " + pid
    print "total is " + total
    if total == 1:
        highlights = query_db('select * from highlights where pid=?', [pid], one=False)
        if not highlights:
            return jsonify(ok = False, content = None)
        #TODO: combine all highlight data and send the bunch.
        return jsonify(ok = False, content = None)
    else:
        highlights = query_db('select * from highlights where pid=? and uid=?', [pid, uid], one=True)
        if not highlights:
            return jsonify(ok = False, content = None)
    return jsonify(ok = True, content = highlights['json'])

