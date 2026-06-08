import time
from typing import AsyncGenerator
import google.generativeai as genai
from app.adapters.base import BaseAIAdapter, AIResponse
from app.core.config import settings


class GeminiAdapter(BaseAIAdapter):
    provider = "gemini"
    display_name = "Gemini 2.5"

    def __init__(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        self._model_name = settings.GEMINI_MODEL

    def _convert_messages(self, messages: list[dict]) -> tuple[str, list[dict]]:
        system_parts = []
        history = []
        last_user = None

        for msg in messages:
            if msg["role"] == "system":
                system_parts.append(msg["content"])
            elif msg["role"] == "user":
                last_user = msg["content"]
                if history and history[-1]["role"] == "user":
                    history.append({"role": "model", "parts": ["[continued]"]})
                history.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                history.append({"role": "model", "parts": [msg["content"]]})

        system_instruction = " ".join(system_parts) if system_parts else None
        # Remove last user message from history (it goes as the prompt)
        if history and history[-1]["role"] == "user":
            history = history[:-1]

        return system_instruction, history, last_user

    async def generate(self, messages: list[dict], max_tokens: int = 1000) -> AIResponse:
        if not settings.GOOGLE_API_KEY:
            return AIResponse(
                provider=self.provider,
                display_name=self.display_name,
                content="[Google API key not configured]",
                tokens_used=0,
                latency_ms=0,
                error="API key missing",
            )

        start = time.time()
        try:
            system_instruction, history, prompt = self._convert_messages(messages)
            generation_config = genai.types.GenerationConfig(max_output_tokens=max_tokens)

            model_kwargs = {"model_name": self._model_name, "generation_config": generation_config}
            if system_instruction:
                model_kwargs["system_instruction"] = system_instruction

            model = genai.GenerativeModel(**model_kwargs)
            chat = model.start_chat(history=history)
            response = await chat.send_message_async(prompt or "")

            latency = int((time.time() - start) * 1000)
            return AIResponse(
                provider=self.provider,
                display_name=self.display_name,
                content=response.text,
                tokens_used=0,
                latency_ms=latency,
            )
        except Exception as e:
            latency = int((time.time() - start) * 1000)
            return AIResponse(
                provider=self.provider,
                display_name=self.display_name,
                content=f"[Gemini error: {str(e)}]",
                tokens_used=0,
                latency_ms=latency,
                error=str(e),
            )

    async def stream(self, messages: list[dict], max_tokens: int = 1000) -> AsyncGenerator[str, None]:
        if not settings.GOOGLE_API_KEY:
            yield "[Google API key not configured]"
            return

        try:
            system_instruction, history, prompt = self._convert_messages(messages)
            generation_config = genai.types.GenerationConfig(max_output_tokens=max_tokens)
            model_kwargs = {"model_name": self._model_name, "generation_config": generation_config}
            if system_instruction:
                model_kwargs["system_instruction"] = system_instruction

            model = genai.GenerativeModel(**model_kwargs)
            chat = model.start_chat(history=history)
            response = await chat.send_message_async(prompt or "", stream=True)

            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"[Gemini error: {str(e)}]"
