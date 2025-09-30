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
		<div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
	);
}
