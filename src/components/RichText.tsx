import { Fragment, useMemo } from 'react';
import katex from 'katex';

// Lightweight inline markup for flashcard content, authored directly in data.ts (never user
// input, so injecting KaTeX's HTML output below is safe):
//   $...$ / $$...$$  -> math, rendered via KaTeX instead of unicode-superscript approximations
//   **...**          -> emphasis on a key term
//   ==...==          -> highlight under a key number/fact, the thing a student's eye should
//                       land on first when scanning the card
const TOKEN_SPLIT = /(\$\$[^$]+\$\$|\$[^$]+\$|\*\*[^*]+\*\*|==[^=]+==)/g;

type Props = {
  text: string;
  /** Classes for ==highlight== marks; defaults to the app-wide `.neo-highlight` marker. */
  markClass?: string;
  /** Classes for **emphasis** terms; unstyled by default (inherits the surrounding rule). */
  strongClass?: string;
};

export function RichText({ text, markClass = 'neo-highlight', strongClass }: Props) {
  const parts = useMemo(() => text.split(TOKEN_SPLIT).filter((part) => part.length > 0), [text]);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <MathSpan key={i} expr={part.slice(2, -2)} display />;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <MathSpan key={i} expr={part.slice(1, -1)} />;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className={strongClass}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <mark key={i} className={markClass}>
              {part.slice(2, -2)}
            </mark>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function MathSpan({ expr, display = false }: { expr: string; display?: boolean }) {
  const html = katex.renderToString(expr, { throwOnError: false, displayMode: display });
  // eslint-disable-next-line react/no-danger
  return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}
