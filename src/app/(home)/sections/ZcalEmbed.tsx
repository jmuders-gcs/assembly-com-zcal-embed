import Script from 'next/script';
import { Body, Heading } from '@assembly-js/design-system';

interface ZcalEmbedProps {
  inviteUrl: string;
}

export function ZcalEmbed({ inviteUrl }: ZcalEmbedProps) {
  return (
    <section>
      <div className="mb-4">
        <Heading size="xl">Book a Meeting</Heading>
        <Body size="base" className="text-gray-500 mt-1">
          Choose a time that works for you.
        </Body>
      </div>

      <Script
        src="https://static.zcal.co/embed/v1/embed.js"
        strategy="afterInteractive"
      />

      <div className="zcal-inline-widget zcal-embed-mask min-h-[700px] rounded-lg bg-white p-2">
        <a href={inviteUrl}>Schedule a meeting</a>
      </div>
    </section>
  );
}