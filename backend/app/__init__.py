from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import init_db
from app.models import *  # noqa: F401,F403
from app.routes.auth_routes import auth_bp
from app.routes.case_routes import case_bp
from app.routes.investigation_routes import investigation_bp
from app.routes.profile_routes import profile_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}},
        supports_credentials=True,
    )

    init_db(app)

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(case_bp, url_prefix='/api')
    app.register_blueprint(investigation_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/api')

    @app.get('/')
    def index():
        return {'message': 'CASEFILE API is running.'}

    return app
