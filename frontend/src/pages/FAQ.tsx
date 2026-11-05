import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Accordion, type AccordionItem } from '../components/common/Accordion';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs: AccordionItem[] = [
    {
      id: "faq-arch-1",
      category: "Architecture",
      question: "Why does NEXORA use six specialist AI agents instead of one unified model prompt?",
      answer: "A single monolithic prompt is difficult to validate, prone to hallucination, and struggles to balance conflicting constraints like typography analysis vs legal claim substantiation. By splitting the audit into six dedicated guardians (Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians) running in parallel via Python asyncio, each agent operates with a focused prompt, strict JSON schema, and dedicated evidence requirements. The Arbiter then synthesizes the outputs objectively."
    },
    {
      id: "faq-arch-2",
      category: "Architecture",
      question: "What model engines are supported by NEXORA?",
      answer: "NEXORA is built on a provider-independent AI gateway. It supports cloud models such as Google Gemini 1.5/2.0 API for advanced multimodal visual reasoning, as well as local air-gapped models via Ollama (such as Llama 3) for organizations that cannot permit external API network traffic."
    },
    {
      id: "faq-recall-1",
      category: "Advertisement Recall",
      question: "How does the Advertisement Recall Engine identify affected advertisements?",
      answer: "When a new document version is approved in the Knowledge Hub (e.g., Specification Sheet v3.2 replaces v3.1), the Recall Engine's version delta logic computes semantic and numerical differences. It queries the MongoDB Advertisement Registry using linked fact IDs and semantic vector matching to identify every published or approved creative citing the deprecated data, immediately generating prioritized remediation alerts."
    },
    {
      id: "faq-recall-2",
      category: "Advertisement Recall",
      question: "Why was Advertisement Recall included in the current development scope?",
      answer: "While the original Round 1 roadmap conceptualized Recall for Round 3, Team PINNACLE made a deliberate architectural decision to bring the Advertisement Recall Engine into the active build because pre-publication review and post-publication recall are two halves of the same governance loop. Without recall, advertisements inevitably suffer from factual aging over time."
    },
    {
      id: "faq-hub-1",
      category: "Brand Knowledge Hub",
      question: "What prevents someone from uploading an incorrect document and ruining future audits?",
      answer: "NEXORA enforces a strict Administrator approval gate. Newly uploaded documents (PDFs, DOCX files, PPTX decks, or style sheets) remain in an 'unapproved' quarantine state. They are not indexed into ChromaDB or used by RAG guardians until a designated Brand Administrator explicitly validates and approves them."
    },
    {
      id: "faq-memory-1",
      category: "Human Oversight",
      question: "How does Review Memory work without silently changing official brand guidelines?",
      answer: "NEXORA strictly bifurcates human feedback: Review Memory (containing reviewer decisions, exceptions, and accepted/rejected rationales) is stored in ChromaDB solely as advisory context for future human reviewers. It cannot overwrite Official Brand Knowledge. Only an Administrator can promote an approved precedent into official company policy."
    },
    {
      id: "faq-sec-1",
      category: "Security & Privacy",
      question: "Is customer brand data used to train AI models?",
      answer: "Absolutely not. NEXORA's architecture operates under zero-data-retention principles. Tenant data is isolated in dedicated MongoDB collections and ChromaDB namespaces, and proprietary documents are never shared or used for third-party machine learning model training."
    },
    {
      id: "faq-sec-2",
      category: "Security & Privacy",
      question: "What happens if an uploaded creative contains prompt-injection attacks?",
      answer: "All submitted advertisements, extracted text, and OCR outputs are treated strictly as untrusted data inputs. They are strictly encapsulated in system prompts within sanitized delimiters, and agent system instructions are protected against instructional override."
    }
  ];

  const filteredFaqs = faqs.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Frequently Asked Questions (FAQ) — Architecture & Governance"
        description="Find detailed answers to common questions about NEXORA's multi-agent architecture, Advertisement Recall engine, Brand Knowledge Hub, and data security."
      />

      <SectionHeader
        badge="Platform FAQ"
        title="Frequently Asked"
        highlight="Questions"
        description="Comprehensive technical and operational answers regarding NEXORA's design system, six-agent pipeline, and continuous recall monitoring."
      />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <Input
          placeholder="Search question or technical term (e.g. 'Recall', 'ChromaDB', 'Prompt Injection')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-glacial" />}
        />

        <Tabs
          tabs={[
            { id: 'all', label: 'All Questions', count: faqs.length },
            { id: 'Architecture', label: 'Multi-Agent', count: 2 },
            { id: 'Advertisement Recall', label: 'Recall Engine', count: 2 },
            { id: 'Brand Knowledge Hub', label: 'Knowledge Hub', count: 1 },
            { id: 'Human Oversight', label: 'Review Memory', count: 1 },
            { id: 'Security & Privacy', label: 'Security', count: 2 },
          ]}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          variant="pills"
        />
      </div>

      {/* Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-muted rounded-2xl border border-dashed border-slate-border">
          No FAQs match your search query "<span className="text-glacial">{searchQuery}</span>". Try another term or contact Team PINNACLE directly.
        </div>
      ) : (
        <Accordion items={filteredFaqs} allowMultiple={true} />
      )}

      {/* Contact CTA */}
      <div className="rounded-2xl glass-panel border border-slate-border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="text-sm font-semibold text-slate-text">Have a question not listed here?</h4>
          <p className="text-slate-muted mt-0.5">Team PINNACLE is available to discuss custom enterprise deployment and hackathon specifics.</p>
        </div>
        <Link to="/contact" className="shrink-0">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Ask Team PINNACLE
          </Button>
        </Link>
      </div>

    </div>
  );
}
