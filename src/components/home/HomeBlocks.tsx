import Link from 'next/link'
import Image from 'next/image'
import { Article, Category } from '@/types'
import { i18nStrings } from '@/lib/i18n'
import { formatDate, formatRelativeDate, truncate } from '@/lib/utils'

const dict = i18nStrings.en
const FALLBACK_IMAGE = 'https://picsum.photos/seed/asiandot/1200/800'

export const categoryLabel = (a: Article) =>
  a.category ? ((dict as any)[a.category.slug] || a.category.name) : ''

const href = (a: Article) => `/article/${a.slug}`

function Thumb({
  article,
  ratio = '3 / 2',
  sizes,
  priority = false,
}: {
  article: Article
  ratio?: string
  sizes: string
  priority?: boolean
}) {
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio, background: 'var(--bg-surface)' }}>
      <Image
        src={article.coverImage?.url || FALLBACK_IMAGE}
        alt={article.coverImage?.alt || article.title}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  )
}

function FlyTitle({ article }: { article: Article }) {
  const label = categoryLabel(article)
  if (!label && !article.isBreaking) return null
  return (
    <span className="flytitle">
      {article.isBreaking ? `${dict.breaking.charAt(0)}${dict.breaking.slice(1).toLowerCase()} · ` : ''}
      {label}
    </span>
  )
}

function Meta({ article }: { article: Article }) {
  if (!article.publishedAt && !article.readTime) return null
  return (
    <p className="meta mt-2">
      {article.publishedAt && formatDate(article.publishedAt, 'MMM do yyyy')}
      {article.publishedAt && article.readTime ? ' · ' : ''}
      {article.readTime ? `${article.readTime} ${dict.minRead}` : ''}
    </p>
  )
}

/** Image on top, then fly-title, headline and rubric. */
export function Teaser({
  article,
  headlineSize = 20,
  rubricSize = 15,
  showImage = true,
  showRubric = true,
  showMeta = false,
  priority = false,
  sizes = '(max-width: 1024px) 100vw, 25vw',
  ratio,
}: {
  article: Article
  headlineSize?: number | string
  rubricSize?: number | string
  showImage?: boolean
  showRubric?: boolean
  showMeta?: boolean
  priority?: boolean
  sizes?: string
  ratio?: string
}) {
  return (
    <article>
      <Link href={href(article)} className="group block">
        {showImage && (
          <div className="mb-3">
            <Thumb article={article} sizes={sizes} priority={priority} ratio={ratio} />
          </div>
        )}
        <FlyTitle article={article} />
        <h3 className="headline" style={{ fontSize: headlineSize }}>
          {article.title}
        </h3>
        {showRubric && article.excerpt && (
          <p className="rubric mt-2" style={{ fontSize: rubricSize }}>
            {truncate(article.excerpt, typeof headlineSize === 'string' || headlineSize > 24 ? 240 : 150)}
          </p>
        )}
        {showMeta && <Meta article={article} />}
      </Link>
    </article>
  )
}

/** Headline and rubric on the left, a small square image on the right. */
function CompactTeaser({ article }: { article: Article }) {
  return (
    <article>
      <Link href={href(article)} className="group flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <FlyTitle article={article} />
          <h3 className="headline" style={{ fontSize: 18 }}>{article.title}</h3>
          {article.excerpt && (
            <p className="rubric mt-1.5 line-clamp-2" style={{ fontSize: 14 }}>{article.excerpt}</p>
          )}
        </div>
        <div className="w-[96px] sm:w-[120px] flex-shrink-0">
          <Thumb article={article} ratio="1 / 1" sizes="120px" />
        </div>
      </Link>
    </article>
  )
}

const ruleY = { borderTop: '1px solid var(--border)' }

// ─── Top stories ────────────────────────────────────────────────────────────

export function TopStories({
  lead,
  secondary,
  latest,
}: {
  lead: Article
  secondary: Article[]
  latest: Article[]
}) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-0">
        {/* Lead */}
        <div className="lg:col-span-6 lg:pr-6">
          <Teaser
            article={lead}
            headlineSize="clamp(26px, 3.2vw, 36px)"
            rubricSize="clamp(17px, 1.6vw, 19px)"
            showMeta
            priority
            sizes="(max-width: 1024px) 100vw, 640px"
          />
        </div>

        {/* Secondary stories */}
        {secondary.length > 0 && (
          <div className="lg:col-span-3 lg:px-6 lg:border-l" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col gap-6">
              {secondary.map((a, i) => (
                <div key={a.id} className={i > 0 ? 'pt-6' : ''} style={i > 0 ? ruleY : undefined}>
                  <Teaser article={a} headlineSize={20} rubricSize={15} showImage={i === 0} sizes="(max-width: 1024px) 100vw, 300px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest */}
        {latest.length > 0 && (
          <aside
            className={`${secondary.length > 0 ? 'lg:col-span-3' : 'lg:col-span-6'} lg:pl-6 lg:border-l`}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="section-head !mb-2">
              <h2>{dict.latest}</h2>
            </div>
            <ul>
              {latest.map((a) => (
                <li key={a.id} className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Link href={href(a)} className="group block">
                    <span className="meta block mb-1">
                      {a.publishedAt ? formatRelativeDate(a.publishedAt) : categoryLabel(a)}
                    </span>
                    <span className="headline block" style={{ fontSize: 16, lineHeight: 1.25 }}>{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  )
}

// ─── A row of four stories ──────────────────────────────────────────────────

export function StoryRow({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-10">
      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0" style={ruleY}>
        {articles.slice(0, 4).map((a, i) => (
          <div
            key={a.id}
            className={`lg:px-5 ${i === 0 ? 'lg:pl-0' : 'lg:border-l'} ${i === 3 ? 'lg:pr-0' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <Teaser article={a} headlineSize={19} rubricSize={14} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── In brief ───────────────────────────────────────────────────────────────

export function InBrief({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section className="mt-12" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="w-14 h-1 mb-3" style={{ background: 'var(--accent-red)' }} />
          <h2 className="headline" style={{ fontSize: 30 }}>In brief</h2>
          <p className="rubric mt-2" style={{ fontSize: 16 }}>
            Catch up quickly on the stories that matter across Asia and beyond.
          </p>
        </div>
        <ul className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {articles.map((a) => (
            <li key={a.id} className="py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Link href={href(a)} className="group block" style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.45 }}>
                <strong className="font-semibold group-hover:underline underline-offset-2" style={{ color: 'var(--text-primary)' }}>
                  {a.title}.
                </strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{truncate(a.excerpt, 140)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Category section ───────────────────────────────────────────────────────

export function SectionBlock({ category, articles }: { category: Category; articles: Article[] }) {
  if (articles.length === 0) return null
  const [lead, ...rest] = articles
  const name = (dict as any)[category.slug] || category.name

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-12">
      <div className="section-head">
        <h2>
          <Link href={`/category/${category.slug}`} className="!text-[18px] !font-bold hover:!text-[var(--accent-red)]">
            {name}
          </Link>
        </h2>
        <Link href={`/category/${category.slug}`}>{dict.viewAll} →</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">
        <div className="lg:col-span-5 lg:pr-6">
          <Teaser article={lead} headlineSize="clamp(22px, 2.4vw, 26px)" rubricSize={17} sizes="(max-width: 1024px) 100vw, 520px" />
        </div>
        {rest.length > 0 && (
          <div className="lg:col-span-7 lg:pl-6 lg:border-l grid grid-cols-1 md:grid-cols-2 gap-x-6" style={{ borderColor: 'var(--border)' }}>
            {rest.slice(0, 4).map((a, i) => (
              <div
                key={a.id}
                className={`py-4 ${i < 2 ? 'md:pt-0' : ''} ${i === 0 ? 'pt-0' : ''}`}
                style={i === 0 ? undefined : { borderTop: '1px solid var(--border)' }}
              >
                <CompactTeaser article={a} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Editor's picks + most read ─────────────────────────────────────────────

export function PicksAndPopular({ picks, popular }: { picks: Article[]; popular: Article[] }) {
  if (picks.length === 0 && popular.length === 0) return null
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0">
        {picks.length > 0 && (
          <div className="lg:col-span-8 lg:pr-8">
            <div className="section-head"><h2>{dict.editorsPicks}</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {picks.slice(0, 3).map((a) => (
                <Teaser key={a.id} article={a} headlineSize={18} rubricSize={14} sizes="(max-width: 640px) 100vw, 260px" />
              ))}
            </div>
          </div>
        )}
        {popular.length > 0 && (
          <div
            className={picks.length > 0 ? 'lg:col-span-4 lg:pl-8 lg:border-l' : 'lg:col-span-12'}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="section-head"><h2>{dict.mostRead}</h2></div>
            <ol>
              {popular.slice(0, 5).map((a, i) => (
                <li key={a.id} className="flex gap-4 py-3" style={i > 0 ? ruleY : undefined}>
                  <span
                    className="flex-shrink-0 w-8 text-right"
                    style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, color: 'var(--accent-red)', fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                  <Link href={href(a)} className="group block min-w-0">
                    <FlyTitle article={a} />
                    <span className="headline block" style={{ fontSize: 17, lineHeight: 1.25 }}>{a.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
