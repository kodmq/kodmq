import Heading from "@/components/typography/Heading"
import Card, { CardProps } from "@/components/ui/Card"
import { titleize } from "@/lib/utils"

type CardVariants = {
  [key in keyof Pick<CardProps, "variant" | "highlight" | "href">]: CardProps[key][]
}

export default async function StorybookPage() {
  const cardVariants: CardVariants = {
    variant: ["default", "green", "red"],
    highlight: [false, true],
    href: [undefined, "#"],
  }

  return (
    <div>
      <Heading>Storybook</Heading>

      <div className="grid grid-cols-4 gap-4">
        {cardVariants.variant.map((variant) => (
          cardVariants.href.map((href) => (
            cardVariants.highlight.map((highlight) => (
              <Card
                key={`card-${variant}-${highlight}-${href}`}
                variant={variant}
                highlight={highlight}
                href={href}
                pattern={1}
              >
                <Card.Padding>
                  <Card.Title>
                    {titleize(variant)}
                    {highlight && " Highlight"}
                    {href && " with Link"}
                  </Card.Title>
                  <Card.Description>
                    Card content
                  </Card.Description>
                </Card.Padding>
              </Card>
            ))
          ))
        ))}
      </div>
    </div>
  )
}
