import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram } from "lucide-react";

import musaNaManzo from "@/assets/leadership/musa-na-manzo.jpeg";
import ibrahimAbubakar from "@/assets/leadership/ibrahim-abubakar.jpeg";
import abdullahiUmarGaladima from "@/assets/leadership/abdullahi-umar-galadima.jpeg";
import faisalIbrahimOmar from "@/assets/leadership/faisal-ibrahim-omar.jpeg";
import adamuIbrahimAdamu from "@/assets/leadership/adamu-ibrahim-adamu.jpeg";
import nafiuAdamu from "@/assets/leadership/nafiu-adamu.jpeg";
import auduMuhammad from "@/assets/leadership/audu-muhammad.jpeg";
import habibuAbdulmumin from "@/assets/leadership/habibu-abdulmumin.jpeg";
import hafsatAliyu from "@/assets/leadership/hafsat-aliyu.jpeg";
import ubaidaAbdulkadir from "@/assets/leadership/ubaida-abdulkadir.jpeg";
import charityAgasha from "@/assets/leadership/charity-agasha.jpeg";
import yakubuLk from "@/assets/leadership/yakubu-lk.jpeg";
import maryamBauchi from "@/assets/leadership/maryam-bauchi.jpeg";

export const Route = createFileRoute("/leadership")({
  component: LeadershipPage,

  head: () => ({
    meta: [
      {
        title: "Leadership — Tinubu Support Bauchi 2027",
      },
      {
        name: "description",
        content:
          "Meet the leaders driving Tinubu Support Bauchi 2027.",
      },
      {
        property: "og:title",
        content: "Leadership — TSB 2027",
      },
      {
        property: "og:url",
        content: "/leadership",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "/leadership",
      },
    ],
  }),
});

interface Leader {
  full_name: string;
  position: string;
  bio?: string | null;
  photo_url: string;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
}

const leaders: Leader[] = [
  {
    full_name: "Musa Na Manzo",
    position: "Chairman",
    photo_url: musaNaManzo,
  },
  {
    full_name: "Ibrahim Abubakar",
    position: "Financial Secretary",
    photo_url: ibrahimAbubakar,
  },
  {
    full_name: "Abdullahi Umar Galadima",
    position: "Secretary",
    photo_url: abdullahiUmarGaladima,
  },
  {
    full_name: "Faisal Ibrahim Omar",
    position: "Director of Media and Publicity",
    photo_url: faisalIbrahimOmar,
  },
  {
    full_name: "Adamu Ibrahim Adamu",
    position: "Treasurer",
    photo_url: adamuIbrahimAdamu,
  },
  {
    full_name: "Nafiu Adamu",
    position: "Director of Security and Protocol",
    photo_url: nafiuAdamu,
  },
  {
    full_name: "Audu Muhammad",
    position: "Public Relations Officer (PRO)",
    photo_url: auduMuhammad,
  },
  {
    full_name: "Habibu Abdulmumin",
    position: "Member",
    photo_url: habibuAbdulmumin,
  },
  {
    full_name: "Hafsat Aliyu",
    position: "Member",
    photo_url: hafsatAliyu,
  },
  {
    full_name: "Ubaida Abdulkadir",
    position: "Member",
    photo_url: ubaidaAbdulkadir,
  },
  {
    full_name: "Charity Agasha",
    position: "Member",
    photo_url: charityAgasha,
  },
  {
    full_name: "Yakubu LK",
    position: "Member",
    photo_url: yakubuLk,
  },
  {
    full_name: "Maryam Bauchi",
    position: "Member",
    photo_url: maryamBauchi,
  },
];

function LeadershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Page Header */}
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--tsb-green)]">
          Leadership
        </div>

        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">
          Meet Our Leaders
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Committed men and women coordinating TSB's grassroots engagement,
          outreach and advocacy across Bauchi State.
        </p>
      </div>

      {/* Leadership Cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader) => (
          <div
            key={leader.full_name}
            className="overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
          >
            {/* Leader Image */}
            <div className="aspect-[4/3] overflow-hidden gradient-blue">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-100">
                <img
                  src={leader.photo_url}
                  alt={leader.full_name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Leader Details */}
            <div className="p-5 text-center">
              <h2 className="font-display text-lg font-bold">
                {leader.full_name}
              </h2>

              <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-[color:var(--tsb-green)]">
                {leader.position}
              </div>

              {leader.bio && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {leader.bio}
                </p>
              )}

              {/* Social Media Links */}
              <div className="mt-4 flex gap-3 text-muted-foreground">
                {leader.facebook_url && (
                  <a
                    href={leader.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[color:var(--tsb-blue)]"
                    aria-label={`${leader.full_name} Facebook`}
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}

                {leader.twitter_url && (
                  <a
                    href={leader.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[color:var(--tsb-blue)]"
                    aria-label={`${leader.full_name} Twitter`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}

                {leader.instagram_url && (
                  <a
                    href={leader.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[color:var(--tsb-blue)]"
                    aria-label={`${leader.full_name} Instagram`}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}