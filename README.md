# CustomResumeBuiler1

A one-page resume builder. Upload or paste a master resume and a job description, edit the parsed career profile, then export an ATS-style PDF or DOCX. Generation can select and reword. It does not invent employers, skills, technologies, certifications, accomplishments, or metrics.

This slice keeps everything in the browser (`localStorage`). There is no account and no database.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:3847](http://127.0.0.1:3847).

```bash
npm test
```

## AI Providers & Configuration

The app works entirely on local heuristics if no API keys are provided.

To unlock the full AI/RAG orchestration pipeline (semantic retrieval, LLM-based reranking, rewriting, and semantic fact validation), configure your providers in `.env`:

```bash
# Provider: openai (default) | anthropic | google
AI_LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Embeddings: openai (default) | google
AI_EMBEDDING_PROVIDER=openai
```

See `.env.example` for all configurable environment variables (models, temperatures, retrieval settings, and regeneration attempts).

**Note for Anthropic/Google users:**
The SDKs for Anthropic and Google are optional. To use them, install them first:
```bash
npm install @ai-sdk/anthropic
# or
npm install @ai-sdk/google
```

## RAG & Fact Validation Pipeline

When an API key is provided, the generation follows a strict orchestration pipeline to guarantee truthfulness:

1. **Embeddings & Hybrid Retrieval:** Candidate evidence chunks are embedded (cached persistently in a local `.embeddings-cache/` file to save costs) and matched against job requirements using a hybrid score (Cosine Similarity + Keyword Overlap).
2. **LLM Reranker:** The top retrieved chunks are scored contextually by the LLM (0-10) to select the absolute best evidence.
3. **Draft Generation:** The LLM drafts resume lines strictly bound to the cited evidence.
4. **Dual-Layer Fact Validation:**
   - **Layer 1 (Deterministic):** Instantly drops lines that hallucinate metrics (e.g., "40%"), technologies, or employers not present in the cited evidence.
   - **Layer 2 (Semantic):** A strict fact-checking LLM pass verifies that the drafted claim is a faithful paraphrase of the evidence without stretching the truth.
5. **Regeneration Loop:** If the Semantic layer flags a claim as unsupported, the pipeline automatically rejects the draft and forces the LLM to regenerate, providing the failure context.

### Pipeline in Action (Terminal Log Example)
The server logs provide full visibility into this pipeline. Here is an example of the AI catching a hallucination and self-correcting:

```log
[embeddings-store] Loaded 32 cached embeddings from disk (model=text-embedding-3-small)
[embeddings] Batch: all 19 items served from cache (l1+l2)
[retrieval] Query matched 19/19 chunks (topK=19 candidateId=cand-1gt4aq3 semantic=yes)
[reranker] LLM reranked 19/19 items for query "TypeScript. Node.js. PostgreSQL. Kubernetes. Go."
[reranker] Selected top 5 from 19 candidates (provider=llm llm=true)
[semantic-validate] Validated 7 claims: 3 supported, 3 partial, 1 unsupported, 0 review
[pipeline] Regenerating (attempt 2/3)…
[semantic-validate] Validated 6 claims: 6 supported, 0 partial, 0 unsupported, 0 review
 POST /api/generate 200 in 18.6s (next.js: 192ms, application-code: 18.4s)
```

## Flow

1. **Profile.** PDF, DOCX, pasted text, or the built-in sample. Edit and verify your career profile data before generating.
2. **Job.** Paste or upload the posting, or use the sample job.
3. **Match.** Provides explainable sub-scores (Skills Match, Experience Match, Domain Match), the evidence that will be used, and the gaps that will be excluded.
4. **Resume.** Runs the orchestration pipeline, displays the one-page preview, validation notes, and allows PDF/DOCX downloads.

## Architecture

The product architecture is in [docs/architecture.md](docs/architecture.md). The original one-page design is [docs/AI-Powered-Custom-Resume-Builder.pdf](docs/AI-Powered-Custom-Resume-Builder.pdf).
