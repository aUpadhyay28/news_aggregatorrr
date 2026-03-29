def refresh_news_pipeline(hours: int = 72, mode: str = "quick") -> dict:
    mode = mode.lower()
    results = {
        "hours": hours,
        "mode": mode,
        "scraping": {},
        "processing": {},
        "digests": {},
    }

    try:
        from app.runner import run_scrapers
        from app.services.process_anthropic import process_anthropic_markdown
        from app.services.process_digest import process_digests
        from app.services.process_youtube import process_youtube_transcripts
    except ModuleNotFoundError as error:
        missing_package = getattr(error, "name", "unknown")
        raise RuntimeError(
            f"The refresh pipeline needs the missing Python dependency '{missing_package}'. "
            "Install the backend requirements before running refresh."
        ) from error

    scraping_results = run_scrapers(hours=hours)
    results["scraping"] = {
        "youtube": len(scraping_results.get("youtube", [])),
        "openai": len(scraping_results.get("openai", [])),
        "anthropic": len(scraping_results.get("anthropic", [])),
    }

    if mode in {"enriched", "full"}:
        results["processing"]["anthropic"] = process_anthropic_markdown()
        results["processing"]["youtube"] = process_youtube_transcripts()

    if mode == "full":
        results["digests"] = process_digests()

    return results
