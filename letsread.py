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
@app.route('/highlight', methods=['POST'])
def highlight():
    uid = request.args.get('uid')
    pid = request.args.get('pid')
    #TODO: decide what data should be included to indicate highlight location.
    high = request.args.get('high')
    db = get_db()
    db.execute('insert into highlights (uid, pid, nodeid) values (?,?,?)', 
                [uid, pid, high])
    db.commit()
    return jsonify(uid=uid, pid=pid, high=high)

#load all highlights when session page loads.
@app.route('/loadHighlights', methods=['POST'])
def loadHighlights():
    uid = request.args.get('uid')
    pid = request.args.get('pid')
    print "uid is " + uid
    print "pid is " + pid
    highlights = query_db('select * from highlights where pid=?', [pid], one=False)
    #TODO: decide how to load all highlights.
    return jsonify(uid=uid, pid=pid) #placeholder return string.


'''
def show_entries():
    db = get_db()
    cur = db.execute('select title, text from entries order by id desc')
    entries = cur.fetchall()
    return render_template('reader.html', entries=entries)

@app.route('/add', methods=['POST'])
def add_entry():
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    db.execute('insert into entries (title, text) values (?, ?)',
                 [request.form['title'], request.form['text']])
    db.commit()
    flash('New entry was successfully posted')
    return redirect(url_for('show_entries'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_entries'))
    return render_template('login.html', error=error)
'''

