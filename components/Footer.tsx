"use client";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import ContactForm from "./ContactForm";
import HalftoneDots from "./HalftoneDots";
import { SocialIcon } from "./SocialIcons";
import type { FooterContent } from "@/lib/content-types";
import { PRIVACY_URL } from "@/lib/privacy";

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default function Footer({ footer }: { footer: FooterContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <>
      {/* „Írj nekünk” űrlap — minden oldalon a lábléc fölött */}
      <ContactForm />
      <footer
        id="elerhetoseg"
        className="relative z-20 bg-white px-4 pb-8 pt-16"
        // oldalra levágjuk, felfelé a pöttyök átlóghatnak a fölötte lévő szekcióba
        style={{ overflowX: "clip", overflowY: "visible" }}
      >
        <HalftoneDots size={230} zIndex={0} style={{ top: -110, left: -70 }} />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center"
        >
          <Image src="/canva/logo-md-black-trim.png" alt="MD Dance School" width={273} height={219} className="w-auto" style={{ height: 140 }} />

          {/* Elérhetőség */}
          <div className="space-y-4 text-lg text-gray-900 sm:text-xl">
            {footer.email && (
              <p>
                <span className="font-bold">E-mail:</span>{" "}
                <a href={`mailto:${footer.email}`} className="underline underline-offset-2 transition-colors hover:text-md-cyan">
                  {footer.email}
                </a>
              </p>
            )}
            {footer.phone && (
              <p>
                <span className="font-bold">Tel.:</span>{" "}
                <a href={telHref(footer.phone)} className="underline underline-offset-2 transition-colors hover:text-md-cyan">
                  {footer.phone}
                </a>
              </p>
            )}
          </div>

          {footer.address && (
            <p className="max-w-xl text-lg leading-relaxed text-gray-900 sm:text-xl">
              {footer.addressLabel && <span className="font-bold">{footer.addressLabel}:</span>} {footer.address}
            </p>
          )}

          {/* Közösségi ikonok — fekete kör (link nélkül nem kattintható) */}
          {footer.socials.length > 0 && (
            <div className="flex items-center gap-5">
              {footer.socials.map(({ label, href }) => {
                const cls =
                  "flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-colors duration-200";
                return href ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`${cls} hover:bg-md-cyan hover:text-black`}>
                    <SocialIcon label={label} />
                  </a>
                ) : (
                  <span key={label} aria-label={label} className={cls}>
                    <SocialIcon label={label} />
                  </span>
                );
              })}
            </div>
          )}

          <Image
            src="/canva/payment-methods.png"
            alt="Elfogadott fizetési módok: Barion, VISA, VISA Electron, Mastercard, Maestro, American Express"
            width={413}
            height={50}
            className="h-auto w-full max-w-[420px]"
          />
        </motion.div>

        {/* Jogi linkek — szétosztva a szélekre */}
        <div className="relative mx-auto mt-14 flex max-w-6xl flex-wrap justify-between gap-4 text-base text-gray-600 sm:text-lg">
          <a href={PRIVACY_URL} className="transition-colors hover:text-black">
            Adatkezelési tájékoztató
          </a>
          <a href="#" className="transition-colors hover:text-black">
            ÁSZF
          </a>
          <a href="#" className="transition-colors hover:text-black">
            Cookie beállítások
          </a>
        </div>
      </footer>
    </>
  );
}
