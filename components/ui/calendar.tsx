'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayButton, DayPicker, type DayButtonProps } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type CalendarDayStatus = {
  hasPlan: boolean
  logCount: number
}

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  dayStatuses?: Record<string, CalendarDayStatus>
}

function getLogIntensityClass(logCount: number) {
  if (logCount >= 3) return 'bg-primary/35 text-foreground'
  if (logCount === 2) return 'bg-primary/20 text-foreground'
  if (logCount === 1) return 'bg-primary/10 text-foreground'
  return ''
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  dayStatuses = {},
  ...props
}: CalendarProps) {
  const CalendarDayButton = ({ day, modifiers, children, className, ...buttonProps }: DayButtonProps) => {
    const status = dayStatuses[day.isoDate]
    const label = status
      ? `${buttonProps['aria-label']}: 記録${status.logCount}件${status.hasPlan ? '、予定あり' : ''}`
      : undefined

    return (
      <DayButton
        {...buttonProps}
        aria-label={label || buttonProps['aria-label']}
        className={cn(className, 'relative flex flex-col items-center justify-center', modifiers.selected ? '' : getLogIntensityClass(status?.logCount || 0))}
        day={day}
        modifiers={modifiers}
      >
        <span>{children}</span>
        {status?.hasPlan && <span aria-hidden="true" className={cn('absolute bottom-1 h-1 w-1 rounded-full', modifiers.selected ? 'bg-primary-foreground' : 'bg-violet-600')} />}
      </DayButton>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0',
        month: 'w-full space-y-4',
        month_caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-1 top-1 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        month_grid: 'block w-full border-collapse space-y-1 [&_thead]:block',
        weekdays: 'flex w-full justify-between',
        weekday:
          'text-muted-foreground flex aspect-square max-w-11 flex-1 items-center justify-center font-normal text-sm',
        weeks: 'block w-full',
        week: 'mt-3 flex w-full justify-between',
        day: 'relative aspect-square max-w-11 flex-1 p-0 text-center text-base focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-full w-full rounded-md border border-muted bg-muted/50 p-0 text-base font-medium hover:border-muted-foreground/30 hover:bg-muted aria-selected:border-primary aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100'
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'border-muted bg-muted text-foreground',
        outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        DayButton: CalendarDayButton,
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
