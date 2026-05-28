import os
from typing import Dict

from flask import Flask

def create_app(test_config = None) -> Flask:
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )
    
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
        
    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # healthcheck
    @app.route('/health')
    def healthcheck():
        """Used for health checking the app. Returns 200 if the app is healthy."""
        return "OK", 200
    
    from . import db
    db.init_app(app)
    
    return app
    