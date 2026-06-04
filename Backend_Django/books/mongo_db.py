import pymongo
import time

# Connect to MongoDB
try:
    # URL encoded password (replaced @ with %40)
    client = pymongo.MongoClient('mongodb+srv://pprathibaa07_db_user:prathi%4007@cluster0.y6czhmb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', serverSelectionTimeoutMS=5000)
    db = client['LMS']
    # Trigger connection check
    client.server_info()
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

def seed_db():
    if db is None:
        return
    
    # 1. Seed Users if empty
    users_coll = db['users']
    if users_coll.count_documents({}) == 0:
        default_users = [
            {
                'id': 'admin',
                'name': 'Admin User',
                'email': 'admin@library.com',
                'password': 'admin@123',
                'role': 'admin'
            }
        ]
        users_coll.insert_many(default_users)
        print("Seeded default users in MongoDB.")

    # 2. Seed Books if count is low
    books_coll = db['books']
    if books_coll.count_documents({}) < 600:
        books_coll.delete_many({})
        
        categories = [
            'Tamil', 'English', 'Maths', 'Science', 'Social', 'Computer',
            'Biology', 'Chemistry', 'Physics', 'Commerce', 'Zoology',
            'Geography', 'Civics', 'Economics', 'History', 'Botany'
        ]
        
        category_topics = {
            'Tamil': ('Tamil Ilakkiyam', 'Tamil Mozhichuvadu', 'Tamil Ilakkanam', 'Tamil Urainadai', 'Tamil Kavithaigal', 'Tirukkural Study', 'Sangam Classics', 'Kambaramayanam Guide'),
            'English': ('Grammar & Composition', 'Prose & Comprehension', 'Poetry Anthology', 'Literature Studies', 'Writing Skills Handbook', 'Vocabulary Builder', 'Phonetics Intro', 'Drama & Plays'),
            'Maths': ('Algebra Concepts', 'Geometry & Proofs', 'Trigonometry Basics', 'Calculus Fundamentals', 'Probability & Statistics', 'Applied Mathematics', 'Discrete Math Intro', 'Coordinate Geometry'),
            'Science': ('General Science Concepts', 'Environmental Studies', 'Space Science Basics', 'Science Experiments Guide', 'Natural Sciences', 'Integrated Science', 'Science Project Ideas', 'Everyday Science'),
            'Social': ('Social Science Basics', 'Our Environment', 'Civic Life & Society', 'Understanding History', 'Physical Geography', 'Economic Development', 'Human Rights Studies', 'World Cultures'),
            'Computer': ('Introduction to Python', 'Data Structures Basics', 'Computer Architecture', 'Database Management', 'Web Development HTML/CSS', 'Cyber Security Intro', 'Artificial Intelligence Basics', 'Operating Systems'),
            'Biology': ('Human Anatomy Study', 'Plant Physiology', 'Genetics & Heredity', 'Cell Biology Concepts', 'Ecology & Biosphere', 'Microbiology Intro', 'Evolutionary Biology', 'Biotechnology Basics'),
            'Chemistry': ('Organic Chemistry Basics', 'Inorganic Reactions', 'Physical Chemistry', 'Chemical Bonding', 'Periodic Table Guide', 'Analytical Chemistry', 'Polymer Chemistry', 'Environmental Chemistry'),
            'Physics': ('Classical Mechanics', 'Electromagnetism Concepts', 'Thermodynamics Basics', 'Quantum Mechanics Intro', 'Optics & Light Studies', 'Nuclear Physics', 'Astrophysics Exploration', 'Relativity Theory'),
            'Commerce': ('Principles of Accounting', 'Business Studies Intro', 'Marketing Management', 'Financial Accounting', 'Entrepreneurship Guide', 'Auditing Basics', 'Business Communication', 'Banking & Finance'),
            'Zoology': ('Invertebrate Diversity', 'Vertebrate Zoology', 'Animal Physiology', 'Entomology Studies', 'Herpetology Guide', 'Ornithology Basics', 'Ichthyology Studies', 'Mammalogy Intro'),
            'Geography': ('World Geography Guide', 'Map Reading & Cartography', 'Climate & Meteorology', 'Geomorphology Basics', 'Oceanography Intro', 'Human Geography', 'Economic Geography', 'Geographical Systems'),
            'Civics': ('Indian Constitution Guide', 'Democratic Politics', 'Public Administration', 'International Relations', 'Local Self Government', 'Citizenship & Ethics', 'Political Theory Basics', 'Government Systems'),
            'Economics': ('Microeconomics Concepts', 'Macroeconomics Basics', 'Economic History', 'Development Economics', 'International Trade', 'Public Finance Intro', 'Monetary Economics', 'Agricultural Economics'),
            'History': ('Ancient World History', 'Medieval Indian History', 'Modern India Freedom Struggle', 'European History Studies', 'World War I & II History', 'Historiography Concepts', 'Archaeology Introduction', 'Civilizations & Cultures'),
            'Botany': ('Plant Diversity', 'Plant Anatomy & Embryology', 'Algology & Mycology', 'Bryophyte & Pteridophyte Studies', 'Gymsomperm Basics', 'Plant Ecology', 'Economic Botany', 'Phytochemistry Intro')
        }
        
        formats = [
            "Standard 6 Textbook", "Standard 7 Textbook", "Standard 8 Textbook", "Standard 9 Textbook",
            "Standard 10 Textbook", "Standard 11 Textbook", "Standard 12 Textbook", "Reference Guide Vol 1",
            "Reference Guide Vol 2", "Advanced Study Guide", "Exam Preparation Guide", "Interactive Worksheets",
            "Laboratory Manual", "Teacher's Handbook", "Student Workbook", "Mock Test Papers",
            "Solved Question Bank", "Core Concept Workbook", "Essential Reading", "Quick Revision Notes",
            "Comprehensive Analysis", "Theory and Problems", "Self-Study Companion", "Advanced Lectures",
            "Practical Guide", "Mock Exams & Solutions", "Conceptual Review", "Master Class Handout",
            "Topic-Wise Question Bank", "Ultimate Prep Guide", "Foundation Coursebook", "Key Notes & Formulas",
            "Seminar Material", "Project Workbook", "Practice Exercises", "Handy Handbook",
            "Quick Reference Sheets", "Exam Success Kit"
        ]

        authors = [
            "Dr. A. P. J. Kalam", "Prof. R. Srinivasan", "Dr. M. S. Swaminathan", "Prof. Yash Pal",
            "Dr. H. C. Verma", "Prof. H. S. Mani", "Dr. S. K. Jain", "Prof. V. K. Rao",
            "Dr. N. K. Singh", "Prof. R. K. Sharma", "Dr. M. S. Kumar", "Prof. S. R. Bose",
            "Dr. T. R. Gopal", "Prof. K. V. Raju", "Dr. P. S. Ram", "Prof. G. S. Murthy"
        ]

        default_books = []
        book_counter = 1
        for cat in categories:
            topics = category_topics[cat]
            for idx in range(38):
                topic = topics[idx % len(topics)]
                fmt = formats[idx]
                author = authors[(idx + categories.index(cat)) % len(authors)]
                title = f"{topic} - {fmt}"
                total_copies = int((idx % 5) + 3) # 3 to 7 copies
                
                default_books.append({
                    'id': f'b{book_counter}',
                    'title': title,
                    'category': cat,
                    'author': author,
                    'totalCopies': total_copies,
                    'available': total_copies
                })
                book_counter += 1

        books_coll.insert_many(default_books)
        print(f"Seeded {len(default_books)} default books in MongoDB.")

    # 3. Seed User Logs if empty
    logs_coll = db['user_logs']
    if logs_coll.count_documents({}) == 0:
        default_logs = []
        # No default logs needed for initial run if John and Jane are removed
        # logs_coll.insert_many(default_logs)
        print("No default user logs seeded.")

    # 4. Seed notifications if empty
    notif_coll = db['notifications']
    if notif_coll.count_documents({}) == 0:
        default_notifs = []
        # notif_coll.insert_many(default_notifs)
        print("No default notifications seeded.")

# Run seeding when imported
seed_db()

