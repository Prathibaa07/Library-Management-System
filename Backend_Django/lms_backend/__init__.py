try:
    import pymongo.database
    pymongo.database.Database.__bool__ = lambda x: True
except ImportError:
    pass
