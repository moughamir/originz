/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: using DOMPurify */
"use client";

import DOMPurify from "isomorphic-dompurify";

export function SafeHtml({
	html,
	className,
}: {
	html: string;
	className?: string;
}) {
	const clean = DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
	});
	return (
		// eslint-disable-next-line react/no-danger
		<div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
	);
}
