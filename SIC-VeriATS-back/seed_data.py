"""Seed script to populate database with sample data for development and testing."""
import sys
import os
# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus, Requirement, ProficiencyLevel
from app.models.application import Application, ApplicationStatusHistory
from app.models.profile import SensitiveData, PublicProfile, CV
from app.models.validation import Validation
from app.utils.security import hash_password

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


def clear_database(db: Session):
    """Clear all existing data from database in correct order."""
    print("🗑️  Clearing existing data...")
    
    # Delete in reverse dependency order
    db.query(Validation).delete()
    db.query(ApplicationStatusHistory).delete()
    db.query(Application).delete()
    db.query(CV).delete()
    db.query(PublicProfile).delete()
    db.query(SensitiveData).delete()
    db.query(Requirement).delete()
    db.query(Job).delete()
    db.query(User).delete()
    
    db.commit()
    print("✅ Database cleared")


def create_admin_users(db: Session):
    """Create admin users."""
    print("\n👑 Creating admin users...")
    
    admins = [
        {
            "email": "admin@sic-veriats.com",
            "password": "admin123",
            "role": UserRole.ADMIN
        },
        {
            "email": "supervisor@sic-veriats.com",
            "password": "super123",
            "role": UserRole.ADMIN
        }
    ]
    
    for admin_data in admins:
        admin = User(
            email=admin_data["email"],
            hashed_password=hash_password(admin_data["password"]),
            role=admin_data["role"],
            is_active=1
        )
        db.add(admin)
        print(f"  ✅ Admin: {admin_data['email']} (password: {admin_data['password']})")
    
    db.commit()


def create_companies(db: Session):
    """Create company users with detailed profiles."""
    print("\n🏢 Creating companies...")
    
    companies_data = [
        {
            "email": "hr@techsolutions.com",
            "password": "company123",
            "company_name": "Tech Solutions Inc.",
            "company_description": "Empresa líder en soluciones tecnológicas e innovación digital",
            "company_status": "published",
            "company_industry": "Tecnología",
            "company_website": "https://techsolutions.com",
            "company_logo_url": None
        },
        {
            "email": "talent@digitalinnovations.com",
            "password": "company123",
            "company_name": "Digital Innovations",
            "company_description": "Transformación digital y consultoría tecnológica",
            "company_status": "published",
            "company_industry": "Consultoría IT",
            "company_website": "https://digitalinnovations.com",
            "company_logo_url": None
        },
        {
            "email": "jobs@globalsystems.com",
            "password": "company123",
            "company_name": "Global Systems",
            "company_description": "Sistemas empresariales y soluciones ERP",
            "company_status": "draft",
            "company_industry": "Software Empresarial",
            "company_website": "https://globalsystems.com",
            "company_logo_url": None
        },
        {
            "email": "hiring@cloudservices.com",
            "password": "company123",
            "company_name": "Cloud Services Co.",
            "company_description": "Servicios cloud, infraestructura y DevOps",
            "company_status": "published",
            "company_industry": "Cloud Computing",
            "company_website": "https://cloudservices.io",
            "company_logo_url": None
        },
        {
            "email": "rrhh@dataanalytics.com",
            "password": "company123",
            "company_name": "Data Analytics Pro",
            "company_description": "Análisis de datos, BI y Machine Learning",
            "company_status": "published",
            "company_industry": "Data Science",
            "company_website": "https://dataanalytics.pro",
            "company_logo_url": None
        },
        {
            "email": "team@securityfirst.com",
            "password": "company123",
            "company_name": "SecurityFirst Ltd.",
            "company_description": "Ciberseguridad y protección de datos",
            "company_status": "published",
            "company_industry": "Ciberseguridad",
            "company_website": "https://securityfirst.com",
            "company_logo_url": None
        },
        {
            "email": "contact@mobileinnovators.com",
            "password": "company123",
            "company_name": "Mobile Innovators",
            "company_description": "Desarrollo de aplicaciones móviles iOS y Android",
            "company_status": "draft",
            "company_industry": "Desarrollo Móvil",
            "company_website": "https://mobileinnovators.app",
            "company_logo_url": None
        },
        {
            "email": "careers@aiventures.com",
            "password": "company123",
            "company_name": "AI Ventures",
            "company_description": "Inteligencia artificial y automatización",
            "company_status": "published",
            "company_industry": "Inteligencia Artificial",
            "company_website": "https://aiventures.ai",
            "company_logo_url": None
        },
        {
            "email": "jobs@webdevstudio.com",
            "password": "company123",
            "company_name": "WebDev Studio",
            "company_description": "Desarrollo web frontend y backend",
            "company_status": "published",
            "company_industry": "Desarrollo Web",
            "company_website": "https://webdevstudio.dev",
            "company_logo_url": None
        },
        {
            "email": "hr@fintech-solutions.com",
            "password": "company123",
            "company_name": "FinTech Solutions",
            "company_description": "Soluciones financieras y tecnología bancaria",
            "company_status": "published",
            "company_industry": "FinTech",
            "company_website": "https://fintech-solutions.com",
            "company_logo_url": None
        },
    ]
    
    created_companies = []
    for company_data in companies_data:
        company = User(
            email=company_data["email"],
            hashed_password=hash_password(company_data["password"]),
            role=UserRole.COMPANY,
            company_name=company_data["company_name"],
            company_description=company_data["company_description"],
            company_status=company_data["company_status"],
            company_industry=company_data["company_industry"],
            company_website=company_data["company_website"],
            company_logo_url=company_data["company_logo_url"],
            is_active=1
        )
        db.add(company)
        created_companies.append((company, company_data["password"]))
        print(f"  ✅ {company_data['company_name']} ({company_data['company_status']})")
    
    db.commit()
    
    # Refresh to get IDs
    for company, _ in created_companies:
        db.refresh(company)
    
    return created_companies


def create_jobs_and_requirements(db: Session, companies):
    """Create job postings with requirements for each company."""
    print("\n💼 Creating job postings...")
    
    jobs_data = [
        # Tech Solutions Inc.
        {
            "company_idx": 0,
            "title": "Senior Full Stack Developer",
            "description": "Buscamos desarrollador full stack con experiencia en React y Node.js para proyectos enterprise.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "React", "level": ProficiencyLevel.ADVANCED, "desc": "Desarrollo de SPAs complejas", "required": True},
                {"skill": "Node.js", "level": ProficiencyLevel.ADVANCED, "desc": "APIs RESTful y microservicios", "required": True},
                {"skill": "TypeScript", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Tipado estático", "required": True},
                {"skill": "PostgreSQL", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Diseño de bases de datos", "required": False},
            ]
        },
        {
            "company_idx": 0,
            "title": "DevOps Engineer",
            "description": "Experto en automatización e infraestructura cloud.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Docker", "level": ProficiencyLevel.ADVANCED, "desc": "Containerización de aplicaciones", "required": True},
                {"skill": "Kubernetes", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Orquestación de containers", "required": True},
                {"skill": "CI/CD", "level": ProficiencyLevel.ADVANCED, "desc": "Pipelines de despliegue", "required": True},
            ]
        },
        # Digital Innovations
        {
            "company_idx": 1,
            "title": "Frontend Developer",
            "description": "Desarrollador especializado en interfaces de usuario modernas.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Vue.js", "level": ProficiencyLevel.ADVANCED, "desc": "Framework principal", "required": True},
                {"skill": "CSS/SASS", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Estilos responsive", "required": True},
                {"skill": "UX Design", "level": ProficiencyLevel.BEGINNER, "desc": "Principios de diseño", "required": False},
            ]
        },
        {
            "company_idx": 1,
            "title": "UI/UX Designer",
            "description": "Diseñador de experiencias digitales centradas en el usuario.",
            "status": JobStatus.DRAFT,
            "requirements": [
                {"skill": "Figma", "level": ProficiencyLevel.EXPERT, "desc": "Herramienta principal de diseño", "required": True},
                {"skill": "User Research", "level": ProficiencyLevel.ADVANCED, "desc": "Investigación de usuarios", "required": True},
            ]
        },
        # Cloud Services Co.
        {
            "company_idx": 3,
            "title": "Cloud Architect",
            "description": "Arquitecto de soluciones cloud para clientes enterprise.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "AWS", "level": ProficiencyLevel.EXPERT, "desc": "Arquitecturas serverless y escalables", "required": True},
                {"skill": "Terraform", "level": ProficiencyLevel.ADVANCED, "desc": "Infrastructure as Code", "required": True},
                {"skill": "Networking", "level": ProficiencyLevel.ADVANCED, "desc": "VPC, security groups, routing", "required": True},
            ]
        },
        {
            "company_idx": 3,
            "title": "SRE Engineer",
            "description": "Site Reliability Engineer para garantizar disponibilidad 99.9%.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Monitoring", "level": ProficiencyLevel.ADVANCED, "desc": "Prometheus, Grafana", "required": True},
                {"skill": "Linux", "level": ProficiencyLevel.EXPERT, "desc": "Administración de sistemas", "required": True},
            ]
        },
        # Data Analytics Pro
        {
            "company_idx": 4,
            "title": "Data Scientist",
            "description": "Científico de datos para proyectos de machine learning.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Python", "level": ProficiencyLevel.EXPERT, "desc": "Pandas, NumPy, Scikit-learn", "required": True},
                {"skill": "Machine Learning", "level": ProficiencyLevel.ADVANCED, "desc": "Modelos predictivos", "required": True},
                {"skill": "SQL", "level": ProficiencyLevel.ADVANCED, "desc": "Consultas complejas", "required": True},
            ]
        },
        # SecurityFirst Ltd.
        {
            "company_idx": 5,
            "title": "Security Analyst",
            "description": "Analista de seguridad para auditorías y pentesting.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Penetration Testing", "level": ProficiencyLevel.ADVANCED, "desc": "OWASP Top 10", "required": True},
                {"skill": "Network Security", "level": ProficiencyLevel.ADVANCED, "desc": "Firewalls, IDS/IPS", "required": True},
            ]
        },
        # AI Ventures
        {
            "company_idx": 7,
            "title": "ML Engineer",
            "description": "Ingeniero de machine learning para producción.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "TensorFlow", "level": ProficiencyLevel.ADVANCED, "desc": "Deep learning models", "required": True},
                {"skill": "Python", "level": ProficiencyLevel.EXPERT, "desc": "Optimización de código", "required": True},
                {"skill": "MLOps", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Deploy de modelos", "required": False},
            ]
        },
        # WebDev Studio
        {
            "company_idx": 8,
            "title": "Backend Developer",
            "description": "Desarrollador backend con Python/Django o FastAPI.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Python", "level": ProficiencyLevel.ADVANCED, "desc": "Django o FastAPI", "required": True},
                {"skill": "REST APIs", "level": ProficiencyLevel.ADVANCED, "desc": "Diseño de APIs", "required": True},
                {"skill": "PostgreSQL", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Bases de datos relacionales", "required": True},
            ]
        },
        # FinTech Solutions
        {
            "company_idx": 9,
            "title": "Blockchain Developer",
            "description": "Desarrollador blockchain para aplicaciones DeFi.",
            "status": JobStatus.ACTIVE,
            "requirements": [
                {"skill": "Solidity", "level": ProficiencyLevel.ADVANCED, "desc": "Smart contracts", "required": True},
                {"skill": "Web3.js", "level": ProficiencyLevel.INTERMEDIATE, "desc": "Integración frontend", "required": True},
            ]
        },
    ]
    
    for job_data in jobs_data:
        company, _ = companies[job_data["company_idx"]]
        
        job = Job(
            company_id=company.id,
            title=job_data["title"],
            description=job_data["description"],
            status=job_data["status"]
        )
        db.add(job)
        db.flush()  # Get job ID
        
        # Add requirements
        for req_data in job_data.get("requirements", []):
            requirement = Requirement(
                job_id=job.id,
                skill_name=req_data["skill"],
                proficiency_level=req_data["level"],
                description=req_data["desc"],
                is_required=1 if req_data["required"] else 0
            )
            db.add(requirement)
        
        status_emoji = "✅" if job_data["status"] == JobStatus.ACTIVE else "📝"
        print(f"  {status_emoji} {company.company_name}: {job_data['title']} ({len(job_data.get('requirements', []))} requisitos)")
    
    db.commit()


def create_candidates(db: Session):
    """Create candidate users."""
    print("\n👥 Creating candidates...")
    
    candidates = [
        {"email": "candidate1@example.com", "password": "cand123"},
        {"email": "candidate2@example.com", "password": "cand123"},
        {"email": "candidate3@example.com", "password": "cand123"},
        {"email": "candidate4@example.com", "password": "cand123"},
        {"email": "candidate5@example.com", "password": "cand123"},
    ]
    
    for cand_data in candidates:
        candidate = User(
            email=cand_data["email"],
            hashed_password=hash_password(cand_data["password"]),
            role=UserRole.CANDIDATE,
            is_active=1
        )
        db.add(candidate)
        print(f"  ✅ {cand_data['email']}")
    
    db.commit()


def main():
    """Main seeding function."""
    print("=" * 60)
    print("🌱 SIC-VeriATS Database Seeder")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        clear_database(db)
        create_admin_users(db)
        companies = create_companies(db)
        create_jobs_and_requirements(db, companies)
        create_candidates(db)
        
        print("\n" + "=" * 60)
        print("✨ Seeding completed successfully!")
        print("=" * 60)
        print("\n📋 Summary:")
        print(f"   - Admins: {db.query(User).filter(User.role==UserRole.ADMIN).count()}")
        print(f"   - Companies: {db.query(User).filter(User.role==UserRole.COMPANY).count()}")
        print(f"   - Jobs: {db.query(Job).count()}")
        print(f"   - Requirements: {db.query(Requirement).count()}")
        print(f"   - Candidates: {db.query(User).filter(User.role==UserRole.CANDIDATE).count()}")
        
        print("\n🔑 Login credentials:")
        print("   Admin: admin@sic-veriats.com / admin123")
        print("   Company: hr@techsolutions.com / company123")
        print("   Candidate: candidate1@example.com / cand123")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
