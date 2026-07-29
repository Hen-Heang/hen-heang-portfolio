import React from "react"
import Image from "next/image"
import { BriefcaseBusiness, Mail, MapPin } from "lucide-react"
import { Container } from "@/src/components/system/Container"
import { Eyebrow } from "@/src/components/system/Eyebrow"
import { getLanguageFlag } from "@/src/lib/utils/language-flags"
import type { ProfileContentParsed } from "@/src/lib/schemas/content"

export function AboutIntro({ profile }: { profile: ProfileContentParsed }) {
    return (
        <div className="pb-section pt-16 md:pt-20">
            <Container>
                <Eyebrow className="mb-4">About</Eyebrow>
                <h1 className="max-w-4xl leading-tight text-fg">
                    <span className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                        {profile.fullName}
                    </span>{" "}
                    <span className="inline-block text-xl font-medium tracking-[-0.025em] text-fg-secondary sm:text-2xl lg:text-3xl">
                        — {profile.title}
                    </span>
                </h1>

                <div className="mt-10 grid gap-10 md:grid-cols-[160px_1fr] md:items-start">
                    <div className="relative aspect-square w-32 overflow-hidden rounded-xl border border-border md:w-full">
                        <Image
                            src={profile.myImage}
                            alt={profile.fullName}
                            fill
                            sizes="(min-width: 768px) 160px, 128px"
                            className="object-cover"
                            style={{ objectPosition: "center 20%" }}
                            priority
                        />
                    </div>

                    <div className="max-w-2xl">
                        <p className="text-lg leading-relaxed text-fg-secondary">
                            {profile.bio}
                        </p>
                        <p className="mt-4 leading-relaxed text-fg-secondary">
                            I&apos;ve worked in both Cambodia and South Korea — trained at the Korea
                            Software HRD Center, then hired into Korean-language enterprise teams
                            at KOSIGN and now Bizplay. Most of my day is spent on the systems side:
                            APIs, schemas, and the transactions in between.
                        </p>

                        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                            <div>
                                <dt
                                    title="Location"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand"
                                >
                                    <MapPin size={16} aria-hidden />
                                    <span className="sr-only">Location</span>
                                </dt>
                                <dd className="mt-2 text-sm text-fg">{profile.location}</dd>
                            </div>
                            <div>
                                <dt
                                    title="Experience"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand"
                                >
                                    <BriefcaseBusiness size={16} aria-hidden />
                                    <span className="sr-only">Experience</span>
                                </dt>
                                <dd className="mt-2 text-sm text-fg">{profile.yearsExperience} years</dd>
                            </div>
                            <div>
                                <dt
                                    title="Email"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand"
                                >
                                    <Mail size={16} aria-hidden />
                                    <span className="sr-only">Email</span>
                                </dt>
                                <dd className="mt-2 truncate text-sm text-fg">{profile.email}</dd>
                            </div>
                            {profile.languages && profile.languages.length > 0 && (
                                <div>
                                    <dt className="font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">Languages</dt>
                                    <dd className="mt-1.5">
                                        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-fg">
                                            {profile.languages.map((language) => (
                                                <li key={language.name} className="inline-flex items-center gap-1.5">
                                                    <span className="text-base leading-none" aria-hidden>
                                                        {getLanguageFlag(language.name)}
                                                    </span>
                                                    {language.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-fg-muted">Availability</dt>
                                <dd className="mt-1 text-sm text-fg">
                                    {profile.available ? "Open to opportunities" : "Currently engaged"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </Container>
        </div>
    )
}
