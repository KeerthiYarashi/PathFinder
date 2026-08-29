from typing import Dict, List
from schemas.path import SkillGap

import json
import os

def get_role_requirements() -> Dict[str, Dict]:
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'skills.json')
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
            return data.get("roles", {})
    except Exception as e:
        print(f"Warning: Could not load skills.json: {e}")
        return {}

def get_role_requirements_for(target_role: str) -> Dict[str, Dict]:
    """
    Returns role requirements, dynamically recognizing common professions
    and generating structured competencies for custom titles.
    """
    role_key = target_role.strip().lower().replace(" ", "_").replace("/", "_").replace("-", "_")
    base_roles = get_role_requirements()
    
    # 1. Exact or normalized match against skills.json
    if role_key in base_roles:
        return base_roles[role_key]
    if f"role_{role_key}" in base_roles:
        return base_roles[f"role_{role_key}"]
        
    for k, v in base_roles.items():
        clean_k = k.replace("role_", "")
        if clean_k == role_key or clean_k in role_key or role_key in clean_k:
            return v

    # 2. Medical / Healthcare / Doctor
    if any(term in role_key for term in ["doctor", "physician", "medicine", "surgeon", "clinical", "mbbs", "md"]):
        return {
            "human_anatomy": {"name": "Human Anatomy & Physiology", "target_level": 3},
            "clinical_pathology": {"name": "Pathology & Disease Mechanisms", "target_level": 3},
            "pharmacology": {"name": "Clinical Pharmacology & Therapeutics", "target_level": 2},
            "medical_diagnostics": {"name": "Clinical Diagnostics & Patient Assessment", "target_level": 3},
            "medical_ethics": {"name": "Medical Ethics & Healthcare Protocols", "target_level": 2}
        }

    # 3. Nursing / Nurse
    if any(term in role_key for term in ["nurse", "nursing", "rn", "patient care"]):
        return {
            "patient_care_fundamentals": {"name": "Patient Care & Nursing Fundamentals", "target_level": 3},
            "anatomy_physiology": {"name": "Anatomy & Human Physiology", "target_level": 3},
            "medication_administration": {"name": "Medication Administration & Safety", "target_level": 3},
            "emergency_triage": {"name": "Emergency Care & Clinical Triage", "target_level": 2},
            "nursing_documentation": {"name": "Clinical Documentation & Patient Advocacy", "target_level": 2}
        }

    # 4. Cybersecurity Specialist
    if any(term in role_key for term in ["cyber", "security", "infosec", "pentest", "soc", "ethical hack"]):
        return {
            "network_security": {"name": "Computer Networks & Protocols", "target_level": 3},
            "vulnerability_assessment": {"name": "Threat Analysis & Vulnerability Scanning", "target_level": 3},
            "applied_cryptography": {"name": "Applied Cryptography & PKI", "target_level": 2},
            "incident_response": {"name": "Incident Response & Digital Forensics", "target_level": 2},
            "cloud_security": {"name": "Cloud Security & Identity Access Management", "target_level": 2}
        }

    # 5. Product Manager
    if any(term in role_key for term in ["product manager", "product management", "pm", "product owner"]):
        return {
            "product_discovery": {"name": "Product Discovery & User Research", "target_level": 3},
            "agile_scrum": {"name": "Agile Methodologies & Sprint Planning", "target_level": 3},
            "product_analytics": {"name": "Product Metrics & KPI Tracking", "target_level": 2},
            "market_strategy": {"name": "Go-To-Market & Pricing Strategy", "target_level": 2},
            "wireframing_ux": {"name": "Wireframing & UX Prototyping", "target_level": 2}
        }

    # 6. UI/UX Designer
    if any(term in role_key for term in ["ui", "ux", "designer", "design", "figma", "graphic"]):
        return {
            "user_research": {"name": "User Research & Personas", "target_level": 3},
            "wireframing_figma": {"name": "Figma Design & Interactive Prototyping", "target_level": 3},
            "visual_design": {"name": "Design Systems, Typography & Color Theory", "target_level": 3},
            "usability_testing": {"name": "Usability Testing & Iterative Design", "target_level": 2},
            "information_architecture": {"name": "Information Architecture & User Flows", "target_level": 2}
        }

    # 7. Law / Legal
    if any(term in role_key for term in ["law", "legal", "lawyer", "attorney", "paralegal", "judge"]):
        return {
            "legal_research": {"name": "Legal Research & Citation", "target_level": 3},
            "constitutional_law": {"name": "Constitutional & Regulatory Law", "target_level": 3},
            "contract_law": {"name": "Contract Law & Negotiation", "target_level": 3},
            "litigation_advocacy": {"name": "Litigation & Courtroom Advocacy", "target_level": 2},
            "legal_ethics": {"name": "Legal Ethics & Professional Responsibility", "target_level": 2}
        }

    # 8. Finance / Accounting
    if any(term in role_key for term in ["finance", "financial", "accounting", "accountant", "audit", "banking"]):
        return {
            "financial_accounting": {"name": "Financial Accounting & Reporting", "target_level": 3},
            "financial_modeling": {"name": "Financial Modeling & Valuation", "target_level": 3},
            "corporate_finance": {"name": "Corporate Finance & Capital Markets", "target_level": 2},
            "auditing_compliance": {"name": "Auditing & Regulatory Compliance", "target_level": 2},
            "tax_strategy": {"name": "Corporate & Personal Tax Strategy", "target_level": 2}
        }

    # 9. Marketing / Digital Marketing
    if any(term in role_key for term in ["marketing", "marketer", "seo", "growth", "advertising", "social media"]):
        return {
            "seo_content_strategy": {"name": "SEO & Content Marketing Strategy", "target_level": 3},
            "digital_advertising": {"name": "Paid Advertising (Google & Meta Ads)", "target_level": 3},
            "marketing_analytics": {"name": "Marketing Analytics & Attribution", "target_level": 2},
            "brand_management": {"name": "Brand Identity & Copywriting", "target_level": 2},
            "conversion_optimization": {"name": "Conversion Rate Optimization (CRO)", "target_level": 2}
        }

    # 10. Civil / Mechanical / Electrical Engineering
    if "civil" in role_key:
        return {
            "structural_analysis": {"name": "Structural Analysis & Mechanics", "target_level": 3},
            "fluid_mechanics": {"name": "Fluid Mechanics & Hydraulics", "target_level": 3},
            "geotechnical_engineering": {"name": "Geotechnical & Soil Mechanics", "target_level": 2},
            "autocad_civil": {"name": "AutoCAD & Civil 3D Design", "target_level": 2},
            "construction_management": {"name": "Construction Planning & Project Management", "target_level": 2}
        }
    if "mechanical" in role_key:
        return {
            "thermodynamics": {"name": "Applied Thermodynamics & Heat Transfer", "target_level": 3},
            "cad_solidworks": {"name": "SolidWorks & 3D CAD Modeling", "target_level": 3},
            "materials_science": {"name": "Materials Science & Metallurgy", "target_level": 2},
            "fluid_dynamics": {"name": "Fluid Dynamics & Aerodynamics", "target_level": 2},
            "manufacturing_processes": {"name": "Manufacturing & CNC Processes", "target_level": 2}
        }

    # 11. Generic/Custom Role Generator
    clean_title = target_role.strip().title() or "Career Professional"
    slug = clean_title.lower().replace(" ", "_")
    return {
        f"{slug}_fundamentals": {"name": f"{clean_title} Core Fundamentals", "target_level": 3},
        f"{slug}_methodologies": {"name": f"{clean_title} Practical Methodologies", "target_level": 3},
        f"{slug}_tools_standards": {"name": f"{clean_title} Tools & Industry Standards", "target_level": 2},
        f"{slug}_applied_projects": {"name": f"Advanced {clean_title} Case Studies & Projects", "target_level": 2},
        f"{slug}_ethics_leadership": {"name": f"Professional Ethics & Operations Management", "target_level": 2}
    }

def calculate_skill_gaps(target_role: str, current_skills: Dict[str, int], jd_required_skills: Dict[str, int] = None) -> List[SkillGap]:
    """
    Deterministic algorithm to compare what a learner has vs what a role requires.
    """
    if jd_required_skills:
        required_skills = {}
        for skill, level in jd_required_skills.items():
            skill_id = skill.lower().replace(" ", "_")
            required_skills[skill_id] = {"name": skill, "target_level": level}
    else:
        required_skills = get_role_requirements_for(target_role)

    gaps = []

    for skill_id, req_data in required_skills.items():
        target_level = req_data["target_level"]
        skill_name = req_data["name"]
        
        # If the user doesn't have the skill in their dict, their level is 0
        current_level = current_skills.get(skill_id, current_skills.get(skill_name, current_skills.get(skill_name.lower(), 0)))
        
        gap_size = target_level - current_level
        
        # If gap_size is <= 0, the user has already mastered this required skill!
        if gap_size > 0:
            # Determine priority based on gap size
            if gap_size == 3:
                priority = "high"
            elif gap_size == 2:
                priority = "medium"
            else:
                priority = "low"
                
            gaps.append(SkillGap(
                skill_id=skill_id,
                skill_name=skill_name,
                current_level=current_level,
                target_level=target_level,
                gap_size=gap_size,
                priority=priority
            ))
            
    # Sort gaps so highest priority (largest gap) is first
    gaps.sort(key=lambda x: x.gap_size, reverse=True)
    
    return gaps
