from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from services.llm import LLMService
from db.database import get_supabase
from services.vector_store import VectorStoreService

@tool
def get_my_progress(learner_id: str) -> str:
    """Returns the learner's completion count, total modules, and recent scores."""
    db = get_supabase()
    path_res = db.table("learning_paths").select("path_data").eq("learner_id", learner_id).execute()
    if not path_res.data:
        return "No learning path found."
    
    path_data = path_res.data[0].get("path_data", {})
    completed = 0
    total = 0
    for w in path_data.get("weeks", []):
        for m in w.get("modules", []):
            total += 1
            if m.get("status") == "completed":
                completed += 1
    
    return f"Learner has completed {completed} out of {total} modules."

@tool
def get_skill_gap(learner_id: str) -> str:
    """Returns current vs required skill levels for the learner's target role."""
    db = get_supabase()
    from services.data_access import analyze_learner_gaps
    try:
        gaps = analyze_learner_gaps(learner_id, db)
        gap_details = [f"{g.skill_name}: current level {g.current_level}, target level {g.target_level}" for g in gaps.gaps]
        return "Skill Gaps:\n" + "\n".join(gap_details)
    except Exception as e:
        return f"Error fetching skill gaps: {e}"

@tool
def get_current_path(learner_id: str) -> str:
    """Returns the full ordered learning path with module statuses."""
    db = get_supabase()
    path_res = db.table("learning_paths").select("path_data").eq("learner_id", learner_id).execute()
    if not path_res.data:
        return "No learning path found."
    
    path_data = path_res.data[0].get("path_data", {})
    details = []
    for w in path_data.get("weeks", []):
        details.append(f"Week {w['week_number']}:")
        for m in w.get("modules", []):
            status = m.get('status', 'pending')
            details.append(f"  - {m['skill_name']} ({status}): {m['resource']['title']}")
    
    return "\n".join(details)

@tool
def get_next_action(learner_id: str) -> str:
    """Returns the current Next Best Action for the learner."""
    return "Next best action is to continue with the next pending module."

@tool
def search_resources(skill_name: str) -> str:
    """Searches for alternative learning resources for a given skill."""
    vector_store = VectorStoreService()
    results = vector_store.search_resources(skill_name, k=3)
    if not results:
        return f"No alternative resources found for {skill_name}."
    
    details = [f"- {r['title']} ({r.get('type', 'course')}, {r.get('duration_hours', 0)}h)" for r in results]
    return f"Alternative resources for {skill_name}:\n" + "\n".join(details)

MENTOR_SYSTEM_PROMPT = """You are the PathFinder AI Mentor, an expert educational guide.
Your goal is to help the learner achieve their target role. 
Always be encouraging and concise. 
Use your tools to look up their specific path, progress, or skill gaps when answering questions. 
Do NOT hallucinate resources or courses; use the search_resources tool if they ask for alternatives.

Learner Context:
Name: {name}
Target Role: {target_role}
"""

class MentorAgentService:
    def __init__(self, learner_context: dict):
        self.llm_service = LLMService()
        self.model = self.llm_service.model
        self.tools = [get_my_progress, get_skill_gap, get_current_path, get_next_action, search_resources]
        system_msg = MENTOR_SYSTEM_PROMPT.format(
            name=learner_context.get("name", "Learner"),
            target_role=learner_context.get("target_role", "Unknown")
        )
        self.agent = create_react_agent(self.model, self.tools, state_modifier=system_msg)

    def chat(self, message: str, history: list = None) -> tuple[str, list]:
        if history is None:
            history = []
            
        messages = [{"role": "user", "content": message}]
        
        result = self.agent.invoke({"messages": messages})
        
        final_message = result["messages"][-1].content
        
        tools_used = []
        for msg in result["messages"]:
            if hasattr(msg, 'tool_calls') and msg.tool_calls:
                for tc in msg.tool_calls:
                    tools_used.append(tc['name'])
                    
        return final_message, list(set(tools_used))
