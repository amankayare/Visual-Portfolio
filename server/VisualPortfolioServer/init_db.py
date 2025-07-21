from app import app
from models import db, User, Project, Blog, About, Certification, Tag, Author, Experience, TechnicalSkill
from datetime import datetime, date

def init_db():
    """Initialize database with tables and sample data"""
    with app.app_context():
        # Drop and recreate all tables
        db.drop_all()
        db.create_all()
        
        # Create default admin user
        admin_user = User(
            username='admin',
            email='admin@portfolio.com',
            is_admin=True
        )
        admin_user.set_password('admin123')  # Change this in production
        db.session.add(admin_user)
        
        # Create sample author
        author = Author(
            name='Aman Kayare',
            email='aman@example.com'
        )
        db.session.add(author)
        
        # Create sample tags
        tags = [
            Tag(name='React'),
            Tag(name='Python'),
            Tag(name='Flask'),
            Tag(name='Machine Learning'),
            Tag(name='Web Development'),
            Tag(name='API Design'),
            Tag(name='Database'),
            Tag(name='DevOps')
        ]
        for tag in tags:
            db.session.add(tag)
        
        db.session.flush()  # Get IDs for relationships
        
        # Create sample about information
        about = About(
            name='Aman Kayare',
            headline='Full Stack Developer & Tech Enthusiast',
            bio='I am a passionate full-stack developer with expertise in modern web technologies. I love building scalable applications and exploring new technologies.',
            location='India',
            email='aman@example.com',
            phone='+91-XXXXXXXXXX',
            birthday=date(1995, 1, 1),
            social_links={
                'github': 'https://github.com/username',
                'linkedin': 'https://linkedin.com/in/username',
                'twitter': 'https://twitter.com/username'
            }
        )
        db.session.add(about)
        
        # Create sample projects
        projects = [
            Project(
                title='Personal Portfolio Website',
                description='A modern, responsive portfolio website built with React and Flask. Features include dark/light themes, admin panel, and content management system.',
                tech=['React', 'TypeScript', 'Flask', 'SQLAlchemy', 'Tailwind CSS'],
                links=[
                    {'name': 'Live Demo', 'url': 'https://portfolio.example.com'},
                    {'name': 'GitHub', 'url': 'https://github.com/username/portfolio'}
                ],
                project_type='Personal',
                start_date=date(2024, 1, 1),
                end_date=date(2024, 12, 31),
                role='Full Stack Developer',
                team_size=1,
                categories=['Web Development', 'Full Stack'],
                is_visible=True,
                order=1
            ),
            Project(
                title='E-Commerce API',
                description='RESTful API for an e-commerce platform with authentication, product management, and order processing.',
                tech=['Python', 'Flask', 'PostgreSQL', 'JWT', 'Swagger'],
                links=[
                    {'name': 'GitHub', 'url': 'https://github.com/username/ecommerce-api'},
                    {'name': 'API Docs', 'url': 'https://api.example.com/docs'}
                ],
                project_type='Professional',
                start_date=date(2023, 6, 1),
                end_date=date(2023, 12, 31),
                role='Backend Developer',
                team_size=3,
                categories=['API Development', 'Backend'],
                is_visible=True,
                order=2
            )
        ]
        for project in projects:
            db.session.add(project)
        
        # Create sample blog posts
        blogs = [
            Blog(
                title='Building Modern Web Applications with React and Flask',
                excerpt='Learn how to create a full-stack application using React for the frontend and Flask for the backend.',
                content='''
                <h2>Introduction</h2>
                <p>In this comprehensive guide, we'll explore how to build modern web applications using React and Flask...</p>
                <h2>Setting Up the Development Environment</h2>
                <p>First, let's set up our development environment...</p>
                ''',
                date=datetime(2024, 11, 15),
                reading_time=8,
                featured=True,
                author=author,
                tags=[tags[0], tags[2], tags[4]]  # React, Flask, Web Development
            ),
            Blog(
                title='Introduction to Machine Learning with Python',
                excerpt='A beginner-friendly introduction to machine learning concepts and implementation in Python.',
                content='''
                <h2>What is Machine Learning?</h2>
                <p>Machine learning is a subset of artificial intelligence...</p>
                <h2>Getting Started with Python</h2>
                <p>Python provides excellent libraries for machine learning...</p>
                ''',
                date=datetime(2024, 10, 20),
                reading_time=12,
                featured=False,
                author=author,
                tags=[tags[1], tags[3]]  # Python, Machine Learning
            )
        ]
        for blog in blogs:
            db.session.add(blog)
        
        # Create sample certifications
        certifications = [
            Certification(
                name='AWS Certified Solutions Architect',
                issuer='Amazon Web Services',
                date='2024',
                description='Demonstrated expertise in designing distributed systems on AWS',
                skills=['Cloud Computing', 'AWS', 'System Architecture'],
                certificate_id='AWS-SAA-2024-001'
            ),
            Certification(
                name='Python Professional Certification',
                issuer='Python Institute',
                date='2023',
                description='Advanced Python programming and best practices',
                skills=['Python', 'Programming', 'Software Development'],
                certificate_id='PCPP-2023-001'
            )
        ]
        for cert in certifications:
            db.session.add(cert)
        
        # Create sample experiences
        experiences = [
            Experience(
                title='Software Engineer',
                company='Morningstar India Pvt. Ltd.',
                location='Mumbai, India',
                start_date=date(2021, 3, 1),
                is_current=True,
                duration='4+ years',
                responsibilities=[
                    'Collaborated with different teams to create an automated solution that efficiently moved several years(historical)\' worth of data into the data lake system in a short timeframe',
                    'Worked with project managers, developers, quality assurance and other production support teams to solve technical issues',
                    'Mentored MDP\'s, helped new Joiners with getting them accustomed to the applications by providing support, KTs and guidance',
                    'I provided urgent assistance to clients by extracting critical mapping data. Recognizing the recurring nature of these requests, I developed several SQL views to streamline the process. These views allowed for efficient querying and retrieval of relevant data. Additionally, I transformed the extracted data into user-friendly Excel files, enhancing data visualization and accessibility for clients.'
                ],
                achievements=[
                    'Delivered batch and real-time processing based on Event-Driven Architecture developed on .Net Core, Python for Data Ingestion',
                    'Reduced client onboarding time from several months to just a few weeks by developing an end-to-end automation solution. Leveraged .Net Core, AWS Lambda and Python to streamline the process, just by filling the MS form'
                ],
                technologies=['.Net', 'C#', 'Python', 'Docker', 'AWS', 'PostgreSQL'],
                color='from-blue-500 to-purple-600',
                order=1,
                is_visible=True
            ),
            Experience(
                title='Full Stack Developer Intern',
                company='Amstech Incorporation Pvt. Ltd.',
                location='Indore',
                start_date=date(2018, 6, 1),
                end_date=date(2018, 10, 31),
                is_current=False,
                duration='4 months',
                responsibilities=[
                    'Designed application on Java, Spring boot, Angular 3, Bootstrap, MySQL to design and develop an online exam platform',
                    'Designed secured, efficient and robust exam/test interface with UX focused interface'
                ],
                achievements=[
                    'Designed complete end-to-end application with rich features for admin controls',
                    'Secured application by implementing access controls for different user roles',
                    'Established development best practices'
                ],
                technologies=['Java', 'Spring', 'Hibernate', 'HTML/CSS', 'JDBC', 'MySQL'],
                color='from-green-500 to-teal-600',
                order=2,
                is_visible=True
            )
        ]
        for exp in experiences:
            db.session.add(exp)
        
        # Create technical skills data
        technical_skills = [
            TechnicalSkill(
                title='Backend Development',
                skills=[
                    '.Net / C#',
                    'Python / Flask',
                    'PostgreSQL / SQL Server',
                    'REST APIs / MVC',
                    'Event Driven Architecture / Distributed'
                ],
                color='from-green-400 to-emerald-300',
                icon='Terminal',
                order=1,
                is_visible=True
            ),
            TechnicalSkill(
                title='DevOps & Cloud',
                skills=[
                    'AWS',
                    'Docker / ECS',
                    'CI/CD Pipelines',
                    'Monitoring & Logging'
                ],
                color='from-orange-500 to-red-500',
                icon='Globe',
                order=2,
                is_visible=True
            )
        ]
        for skill in technical_skills:
            db.session.add(skill)
        
        # Commit all changes
        db.session.commit()
        print("Database initialized successfully with sample data!")
        print("Default admin user created:")
        print("  Username: admin")
        print("  Password: admin123")
        print("  Email: admin@portfolio.com")

if __name__ == '__main__':
    init_db()