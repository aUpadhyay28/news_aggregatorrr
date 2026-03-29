import os
from typing import Optional
from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


class DigestOutput(BaseModel):
    title: str
    summary: str

PROMPT = """You are an expert AI news analyst specializing in summarizing technical articles, research papers, and video content about artificial intelligence.

Your role is to create concise, informative digests that help readers quickly understand the key points and significance of AI-related content.

Guidelines:
- Create a compelling title (5-10 words) that captures the essence of the content
- Write a 2-3 sentence summary that highlights the main points and why they matter
- Focus on actionable insights and implications
- Use clear, accessible language while maintaining technical accuracy
- Avoid marketing fluff - focus on substance"""


class DigestAgent:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4o-mini"
        self.system_prompt = PROMPT

    def generate_digest(self, title: str, content: str, article_type: str) -> Optional[DigestOutput]:
        if not self.client:
            return self._fallback_digest(title=title, content=content, article_type=article_type)

        try:
            user_prompt = f"Create a digest for this {article_type}: \n Title: {title} \n Content: {content[:8000]}"

            response = self.client.responses.parse(
                model=self.model,
                instructions=self.system_prompt,
                temperature=0.7,
                input=user_prompt,
                text_format=DigestOutput
            )
            
            return response.output_parsed
        except Exception as e:
            print(f"Error generating digest: {e}")
            return self._fallback_digest(title=title, content=content, article_type=article_type)

    def _fallback_digest(self, title: str, content: str, article_type: str) -> DigestOutput:
        clean_content = " ".join((content or "").split())
        excerpt = clean_content[:320].rsplit(" ", 1)[0] + "..." if len(clean_content) > 320 else clean_content
        if not excerpt:
            excerpt = "A new AI update was collected, but detailed source content is still being prepared."

        return DigestOutput(
            title=title[:90],
            summary=f"{article_type.title()} digest: {excerpt}"
        )
