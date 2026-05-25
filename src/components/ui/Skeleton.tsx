import { Card, type CardPadding, type CardTone } from '@/components/ui/Card'

type SkeletonProps = {
  className?: string
}

type SkeletonLine = {
  widthClassName: string
  heightClassName?: string
}

type SkeletonCardProps = {
  eyebrow?: string
  title?: string
  description?: string
  tone?: CardTone
  padding?: CardPadding
  lines?: SkeletonLine[]
}

const defaultLines: SkeletonLine[] = [
  { widthClassName: 'w-24' },
  { widthClassName: 'w-full' },
  { widthClassName: 'w-11/12' },
]

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={['animate-pulse rounded bg-zinc-200', className].join(' ')} />
}

export function SkeletonCard({
  eyebrow,
  title,
  description,
  tone = 'subtle',
  padding = 'lg',
  lines = defaultLines,
}: SkeletonCardProps) {
  const cardHeaderProps = {
    ...(eyebrow ? { eyebrow } : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  }

  return (
    <Card tone={tone} padding={padding} {...cardHeaderProps}>
      <div className='space-y-3'>
        {lines.map((line, index) => (
          <Skeleton
            key={`${line.widthClassName}-${line.heightClassName ?? 'h-4'}-${index}`}
            className={[line.heightClassName ?? 'h-4', line.widthClassName].join(' ')}
          />
        ))}
      </div>
    </Card>
  )
}
