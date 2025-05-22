# Import necessary modules from Django
from django.apps import AppConfig

# Define the configuration class for the 'university' app
class UniversityConfig(AppConfig):
    # Specify the default type of primary key field for models in this app
    default_auto_field = 'django.db.models.BigAutoField'
    
    # Define the name of the app
    name = 'university'
