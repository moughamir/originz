import {
  GalleryVerticalEnd,
  Lightbulb,
  ListChecks,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ContentSectionsProps {
  addSectionRef: (id: string, ref: HTMLElement | null) => void;
}

export function ContentSections({ addSectionRef }: ContentSectionsProps) {
  return (
    <div>
      <div>
        <Badge variant="outline">Kingdom Tales</Badge>
        <h1 className="mt-3 text-3xl font-extrabold">
          The Great Joke Tax
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          In a kingdom far away, where laughter once flowed freely, a
          peculiar tale unfolded about a king who decided to tax the very
          essence of joy itself - jokes and jest.
        </p>
        <Image
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"
          alt="placeholder"
          width={1200}
          height={800}
          className="my-8 aspect-video w-full rounded-md object-cover"
        />
      </div>
      <section
        id="section1"
        ref={(ref) => addSectionRef("section1", ref)}
        className="prose dark:prose-invert mb-8"
      >
        <h2>How the Tax System Works</h2>
        <div className="ml-3.5">
          <div className="relative flex items-start pb-2">
            <div className="bg-border/70 absolute top-[2.75rem] h-[calc(100%-2.75rem)] w-px"></div>
            <div className="absolute ml-[-14px] py-2">
              <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-lg">
                <RefreshCcw className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="pl-12">
              <h3 className="mt-2 text-base font-semibold">
                Registering Your Jokes
              </h3>
              <p>
                All citizens must register their jokes at the Royal Jest
                Office. Each joke is carefully cataloged and assigned a
                tax bracket based on its humor level.
              </p>
            </div>
          </div>
          <div className="relative flex items-start pb-2">
            <div className="bg-border/70 absolute top-[2.75rem] h-[calc(100%-2.75rem)] w-px"></div>
            <div className="absolute ml-[-14px] py-2">
              <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="pl-12">
              <h3 className="mt-2 text-base font-semibold">
                Classification Process
              </h3>
              <p>
                The Royal Jesters evaluate each joke based on wit,
                delivery, and audience reaction. Higher ratings mean
                higher taxes, making the finest jokes a luxury few can
                afford.
              </p>
            </div>
          </div>
          <div className="relative flex items-start pb-2">
            <div className="bg-border/70 absolute top-[2.75rem] h-[calc(100%-2.75rem)] w-px"></div>
            <div className="absolute ml-[-14px] py-2">
              <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-lg">
                <ListChecks className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="pl-12">
              <h3 className="mt-2 text-base font-semibold">
                Tax Collection
              </h3>
              <p>
                Royal tax collectors roam the streets, listening for
                laughter. Anyone caught telling an unregistered joke faces
                steep fines or time in the kingdom&apos;s least amusing
                dungeon.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="section2"
        ref={(ref) => addSectionRef("section2", ref)}
        className="prose dark:prose-invert mb-8"
      >
        <h2>The People&apos;s Rebellion</h2>
        <p>
          The people of the kingdom, feeling uplifted by the laughter,
          started to tell jokes and puns again, and soon the entire
          kingdom was in on the joke.
        </p>
        <div>
          <table>
            <thead>
              <tr>
                <th>King&apos;s Treasury</th>
                <th>People&apos;s happiness</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Empty</td>
                <td>Overflowing</td>
              </tr>
              <tr className="even:bg-muted m-0 border-t p-0">
                <td>Modest</td>
                <td>Satisfied</td>
              </tr>
              <tr className="even:bg-muted m-0 border-t p-0">
                <td>Full</td>
                <td>Ecstatic</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The king, seeing how much happier his subjects were, realized
          the error of his ways and repealed the joke tax. Jokester was
          declared a hero, and the kingdom lived happily ever after.
        </p>
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Royal Decree!</AlertTitle>
          <AlertDescription>
            Remember, all jokes must be registered at the Royal Jest
            Office before telling them
          </AlertDescription>
        </Alert>
      </section>

      <section
        id="section3"
        ref={(ref) => addSectionRef("section3", ref)}
        className="prose dark:prose-invert mb-8"
      >
        <h2>The King&apos;s Plan</h2>
        <p>
          The king thought long and hard, and finally came up with{" "}
          <a href="#">a brilliant plan</a>: he would tax the jokes in the
          kingdom.
        </p>
        <blockquote>
          &ldquo;After all,&rdquo; he said, &ldquo;everyone enjoys a good
          joke, so it&apos;s only fair that they should pay for the
          privilege.&rdquo;
        </blockquote>
        <p>
          The king&apos;s subjects were not amused. They grumbled and
          complained, but the king was firm:
        </p>
        <ul>
          <li>1st level of puns: 5 gold coins</li>
          <li>2nd level of jokes: 10 gold coins</li>
          <li>3rd level of one-liners : 20 gold coins</li>
        </ul>
        <p>
          As a result, people stopped telling jokes, and the kingdom fell
          into a gloom. But there was one person who refused to let the
          king&apos;s foolishness get him down: a court jester named
          Jokester.
        </p>
      </section>
    </div>
  );
}
