// src/components/MarkdownMessage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  return (
    <ReactMarkdown
      className={`markdown-content ${className}`}
      components={{
        // Títulos
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-purple-300 mt-6 mb-4 border-b border-purple-500/30 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-purple-300 mt-5 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2">
            {children}
          </h3>
        ),
        
        // Párrafos
        p: ({ children }) => (
          <p className="text-white/90 font-light leading-relaxed mb-3">
            {children}
          </p>
        ),
        
        // Negritas
        strong: ({ children }) => (
          <strong className="font-bold text-purple-200">
            {children}
          </strong>
        ),
        
        // Cursivas
        em: ({ children }) => (
          <em className="italic text-purple-300/90">
            {children}
          </em>
        ),
        
        // Listas desordenadas
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 ml-2 text-white/90">
            {children}
          </ul>
        ),
        
        // Listas ordenadas
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 ml-2 text-white/90">
            {children}
          </ol>
        ),
        
        // Items de lista
        li: ({ children }) => (
          <li className="leading-relaxed">
            {children}
          </li>
        ),
        
        // Código inline
        code: ({ inline, children }) => {
          if (inline) {
            return (
              <code className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono border border-purple-500/20">
                {children}
              </code>
            );
          }
          // Bloque de código
          return (
            <code className="block bg-black/40 text-purple-200 p-4 rounded-lg my-3 overflow-x-auto font-mono text-sm border border-purple-500/20">
              {children}
            </code>
          );
        },
        
        // Bloques de código
        pre: ({ children }) => (
          <pre className="bg-black/40 rounded-lg overflow-x-auto my-3 border border-purple-500/20">
            {children}
          </pre>
        ),
        
        // Citas
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-3 italic text-purple-200/80 bg-purple-900/10 rounded-r">
            {children}
          </blockquote>
        ),
        
        // Separador horizontal
        hr: () => (
          <hr className="my-6 border-purple-500/30" />
        ),
        
        // Enlaces
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
