import {Link, useNavigate} from "react-router";
import MobileMenu from "@/components/mobile-menu";
import { ReactLenis } from "lenis/react";
import { useEffect } from "react";
import Marquee from "react-fast-marquee";
import AOS from "aos";
import "aos/dist/aos.css";
import pic from "@/assets/solana.jpg"
import pic1 from "@/assets/solanaWhite.jpg"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { DotBackgroundDemo } from "@/components/ui/dot-background";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

import {
  Bitcoin,
  Wallet,
  BarChart3,
  Shield,
  Coins,
  CheckCircle,
} from "lucide-react";
import {FaArrowCircleUp, FaDownload, FaRobot} from "react-icons/fa";
import {MdAccessTime, MdAttachMoney} from "react-icons/md";
import axios from "axios";

export function Header() {
  return (
      <>
        <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 shadow-sm border-b border-gray-200">
          <div className="h-20 flex items-center justify-between px-5 md:container mx-auto">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                SOLANAP2P
              </p>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="px-5">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="px-5">Register</Button>
              </Link>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-20" />
      </>
  );
}
export default function Home() {
  useEffect(() => {
    AOS.init({ once: true });
    AOS.refresh();
  }, []);

    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ once: true });
        AOS.refresh();

        // Fetch system config
        axios
            .get(`${baseUrl}system-config`)
            .then((res) => {
                const isMaintenance = res?.data?.data?.maintain === 1;
                if (isMaintenance) {
                    navigate("/maintenance");
                }
            })
            .catch((err) => {
                console.error("System config fetch failed:", err);
            });
    }, [navigate]);

  return (
    <ReactLenis root>
      <div className="">
        {/* Header */}
        <Header />

        <HeroSection />
        <HowItWorksSection/>

        <WhatIsSection />

        <P2PSection />

        {/* Services Section */}
        <ServicesSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* FAQ Section */}
        <FAQSection />

        <SPCUpdateHighlights />

        {/* Footer */}
        <Footer />
      </div>
    </ReactLenis>
  );
}

const HeroSection = () => {
  return (
      <>
        <main className="relative pt-28 px-6 md:px-10 min-h-[calc(100vh-80px)] bg-white text-gray-900 overflow-hidden">
          {/* Background */}
          <DotBackgroundDemo />
          <div className="absolute -z-10 top-0 left-0 w-72 h-72 rounded-full bg-primary opacity-20 blur-[120px] animate-pulse"></div>
          <div className="absolute -z-10 bottom-10 right-10 w-72 h-72 rounded-full bg-[#00b1ed] opacity-20 blur-[160px] animate-pulse"></div>

          {/* Hero Content */}
          <div className="container mx-auto flex flex-col items-center justify-center text-center py-16 gap-8">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-primary uppercase tracking-widest">
              🚀 Join The Future of P2P Finance
            </p>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
              Welcome to <span className="text-primary">SMART</span> <br />
              <span className="text-[#00b1ed]">SC (Solana P2P Connect)</span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl text-gray-600">
              The world's first community-driven Bid, Rebid & Ask system powered by Web3 and secured by USDT SPL on the Solana Network.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link to="/login">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-md"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-primary to-[#00b1ed] text-white shadow-xl"
                >
                  Register Now
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full max-w-6xl">
              {[
                "5-hour confirmation timer keeps things fast and fair",
                "Defaulters who submit fake receipts are blocked instantly",
                "No drama. Just clean P2P value exchange",
                "You can bid from $20 to $3000",
                "Rebid the same amount in 30 days to receive 2x",
                "Earn referral commissions across 3 levels",
                "Bid, Rebid & Ask windows are open 24/7"
              ].map((feature, idx) => (
                  <div
                      key={idx}
                      className="border border-gray-200 bg-white rounded-2xl p-5 text-base font-medium shadow hover:shadow-lg transition duration-300"
                  >
                    {feature}
                  </div>
              ))}
            </div>
          </div>
        </main>

        {/* Marquee Banner */}
        <div className="bg-gradient-to-r from-primary to-[#00b1ed] h-12 flex items-center text-white font-semibold text-sm sm:text-base border-t border-b border-dark">
          <Marquee speed={40} gradient={false}>
            {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="mx-6">
              🔥 No Recommitment • 100% Transparency • 200% Return in 10 Days 🔥
            </span>
            ))}
          </Marquee>
        </div>
      </>
  );
};

const WhatIsSection = () => {
  return (
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-center gap-12">

          {/* Text Section */}
          <div className="lg:w-1/2 w-full text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="bg-primary rounded-full size-6 sm:size-8 flex items-center justify-center mr-2">
                <span className="text-white text-xs sm:text-base font-bold">!</span>
              </div>
              <span className="text-primary text-sm sm:text-base uppercase font-medium">
            ABOUT SOLANA P2P CONNECT:,
          </span>
            </div>

            <h6 className="text-3xl sm:text-3xl  font-bold mb-6 leading-tight">
              HE FIRST EVER DECENTRALIZED, WEB3 & AI-POWERED SOLANA USDT-SPL P2P PLATFORM
              Solana is a blockchain platform designed to host decentralized and scalable applications. Founded in 2017 with the pioneering work of Anatoly Yakovenko and his team at Solana Labs. Yakovenko, a former Qualcomm engineer, aimed to create a blockchain that could overcome the limitations of existing platforms like Ethereum, particularly in terms of scalability and transaction speed. Today Solana is known as the Ethereum Killer.
            </h6>

            <p className="text-muted-foreground text-sm lg:text-base mb-8 max-w-lg mx-auto lg:mx-0">
              SolanaP2PConnect is designed for global adoption of Solana and its 100% decentralized P2P system with no central authority, no central system account, making it highly secured and resistant to scams or hacking
              Where Members Bid, Rebid, and Ask to Get 100% Returns in 30 Days.
            </p>

            <Link to="/dashboard">
              <Button size="lg" className="inline-flex items-center">
                BID NOW
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* Image Section */}
          <div className="lg:w-1/2 w-full relative rounded-3xl overflow-hidden shadow-lg">
            <img
                src={pic}
                alt="SPC Illustration"
                className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
  );

};

const P2PSection = () => {
  return (
    <>
      <section className="min-h-[600px] px-4 py-20 md:py-24">
        <div
            className="container w-full  flex items-center lg:flex-row flex-col gap-8 justify-center mx-auto overflow-hidden">
          <div className="lg:w-1/2 w-full relative rounded-3xl overflow-hidden shadow-lg">
            <img
                src={pic1}
                alt="SPC Illustration"
                className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:w-1/2 lg:pl-12">
            <div className="mb-4">
              <span className="text-primary text-sm sm:text-base uppercase font-medium">
                SolanaP2PConnect
              </span>
              <div className="w-24 h-0.5 sm:h-1 bg-primary mt-2"></div>
            </div>

            <h2 className="text-3xl sm:text-3xl font-bold mb-6 leading-tight">
              Welcome to SC (Solana P2P Connect), the world's first community-driven Bid, Rebid & Ask system powered by Web3 and the reliability of USDT SPL on Solana Network
            </h2>
            <h2 className="text-3xl sm:text-3xl font-bold mb-6 leading-tight">
              In a world filled with broken promises and endless cycles, SC offers you a transparent, decentralized, and profitable alternative. No hidden rules. Just clean, smart earning
            </h2>

            {/*<p className="text-gray-400 text-sm sm:text-base mb-8">*/}

            {/*</p>*/}

            <Link
                to="#learn-more"
                className="text-primary text-sm sm:text-base inline-flex items-center hover:underline"
            >
              Learn more
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
              >
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

function ServicesSection() {
  const services = [
    {
      icon: <Bitcoin className="text-primary h-7 w-7"/>,
      title: "P2P Cryptocurrency Trading",
      description:
          "Trade Bitcoin, Ethereum, and other cryptocurrencies directly with other users through our secure peer-to-peer platform.",
    },
    {
      icon: <Wallet className="text-primary h-7 w-7" />,
      title: "Secure Wallet Services",
      description:
        "Store your digital assets safely with our state-of-the-art wallet technology featuring advanced encryption and multi-signature protection.",
    },
    {
      icon: <BarChart3 className="text-primary h-7 w-7" />,
      title: "Market Analysis Tools",
      description:
        "Access real-time market data, price charts, and analytical tools to make informed trading decisions.",
    },
    {
      icon: <Shield className="text-primary h-7 w-7" />,
      title: "Escrow Protection",
      description:
        "Trade with confidence using our escrow service that protects both buyers and sellers throughout the transaction process.",
    },
    {
      icon: <Coins className="text-primary h-7 w-7" />,
      title: "Multi-Currency Support",
      description:
        "Trade a wide variety of cryptocurrencies and digital assets on our platform with competitive rates and low fees.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <path d="M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        </svg>
      ),
      title: "24/7 Customer Support",
      description:
        "Get assistance anytime with our dedicated customer support team available 24/7 via live chat, email, and phone.",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            SOLANAP2P Trading offers a comprehensive suite of services to meet
            all your cryptocurrency trading needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-primary/10 p-6 rounded-lg border border-primary/20  transition-all duration-300"
            >
              <div className="bg-primary/10 size-10 sm:size-14  rounded-full flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    "Secure P2P Trading",
    "Low Transaction Fees",
    "Multi-Currency Support",
    "Advanced Encryption",
    "Real-time Market Data",
    "Mobile Trading App",
    "Escrow Protection",
    "24/7 Customer Support",
    "Fast Transaction Processing",
    "Two-Factor Authentication",
    "User-Friendly Interface",
    "Global Accessibility",
  ];

  return (
    <section
      id="features"
      className="py-20 md:py-24 px-4 w-full md:px-10 min-h-[800px] h-full flex items-center justify-center overflow-hidden"
    >
      <div className="container mx-auto w-full px-4 flex flex-col lg:flex-row items-center gap-8 justify-center">
        <div className="lg:w-1/2 w-full">
          <div className="mb-4">
            <span className="text-primary text-sm sm:text-base uppercase font-medium">
              PLATFORM FEATURES
            </span>
            <div className="w-24 h-0.5 sm:h-1 bg-primary mt-2"></div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Why Choose SOLANAP2P Trading Platform
          </h2>

          <p className="text-gray-400 text-sm sm:text-base  mb-8">
            Our platform is designed with security, efficiency, and user
            experience in mind. We provide the tools and features you need to
            trade cryptocurrencies with confidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <div className="relative w-full">
            <div className="absolute -inset-0 rounded-xl bg-primary/10 blur-xl"></div>
            <div className="bg-primary/20 min-h-[400px] h-full w-full aspect-video rounded-xl border border-primary/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "What is SolanaP2PConnect and Who Owns it?",
      answer:
          "SolanaP2PConnect (SPC) is a fully decentralised, peer-to-peer (P2P) Web3 ecosystem built on BLOCKCHAIN TECHNOLOGY technology. It operates transparently on the blockchain and is entirely owned and controlled by its members.",
    },
    {
      question: "Is the SPC platform secure and scam-proof?",
      answer:
          "Yes, SPC is designed as a 100% decentralised P2P system with no central authority and no central system account, making it highly secure and resistant to scams or hacking.",
    },
    {
      question: "What is the minimum and maximum bid allowed?",
      answer: "Minimum bid: $10 USDT. Maximum bid: $300 USDT.",
    },
    {
      question: "What are the bidding and rebidding times?",
      answer:
          "Bidding, rebidding, and asking are open twice daily: 10:00 – 10:30 AM CET and 10:00 – 10:30 PM CET.",
    },
    {
      question: "Is proof of payment required after bidding?",
      answer:
          "Yes. After making a bid, you must upload a valid proof of payment (e.g., transaction hash ID) for verification.",
    },
    {
      question: "What happens if the person I paid does not confirm my payment?",
      answer:
          "You have a 3-hour timer on your dashboard. If the recipient fails to confirm your payment within this window, the system will automatically verify and confirm your transaction, provided the uploaded proof is genuine and verifiable on the blockchain.",
    },
    {
      question: "What if someone assigned to pay me fails to do so within 3 hours?",
      answer:
          "If the assigned person doesn’t complete the payment within the 3-hour countdown, the system will automatically block them and assign a new bidder to you.",
    },
    {
      question: "Do I need to contact the person I'm paying before making the payment?",
      answer:
          "No, direct contact is not required. Our AI telegram bot will notify the person automatically. Simply make the payment and upload your proof. The recipient will confirm upon receiving the funds.",
    },
    {
      question: "Will SPC be sustainable in the long term?",
      answer:
          "Yes. The rebid and ask mechanism ensures the continued sustainability of the ecosystem.",
    },
    {
      question: "How long does it take for my bid to mature and yield returns?",
      answer: "Each bid matures in 10 days for full returns.",
    },
    {
      question: "How does the rebid policy work?",
      answer:
          "Participants are required to rebid 100% of their capital on the maturity date before requesting a withdrawal of 200%. Note: Do not rebid before your funds have fully matured.",
    },
    {
      question: "What if I rebid before the maturity date?",
      answer:
          "Rebidding early resets your cycle. It becomes a new bid, and the 10-day maturity period starts afresh.",
    },
    {
      question: "Do I have to refer others to earn, and what is the referral bonus?",
      answer:
          "Referring others is optional. However, you earn a 10% referral bonus from the bids made by your direct referrals.",
    },
    {
      question: "Can I start with a small bid and increase later?",
      answer:
          "Yes. You can begin with any amount within the allowed range (minimum of $10) and increase in subsequent cycles.",
    },
    {
      question: "What is the minimum withdrawal amount?",
      answer: "The minimum amount you can withdraw is $20.",
    },
    {
      question: "Are there generational or multi-level bonuses?",
      answer:
          "No. SPC offers only a direct referral bonus of 10%. There are no multi-level or generational bonuses.",
    },
    {
      question: "Does SPC have a technical support team?",
      answer:
          "Yes, our support team operates 24/7. Send all inquiries and complaints to our support telegram bot or via email to support@SolanaP2PConnect.com.",
    },
  ];

  return (
      <section id="faqs" className="bg-primary/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
              Find answers to the most common questions about SolanaP2PConnect (SPC) and how the platform works.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`}>
                    <AccordionTrigger className="text-sm sm:text-lg md:text-xl">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
  );
}
function SPCUpdateHighlights() {
  const updates = [
    {
      icon: <MdAccessTime className="text-blue-600 text-3xl" />,
      title: "Cycle Duration",
      description: "Bidding cycle now lasts 10 days instead of 14 days.",
    },
    {
      icon: <FaArrowCircleUp className="text-green-600 text-3xl" />,
      title: "Direct Referral Commission",
      description: "Earn 10% on every direct referral, increased from 7.5%.",
    },
    {
      icon: <MdAttachMoney className="text-purple-600 text-3xl" />,
      title: "Minimum Withdrawal",
      description: "You can now withdraw from as little as $20 (was $10).",
    },
    {
      icon: <FaRobot className="text-pink-600 text-3xl" />,
      title: "AI Telegram Bot Support",
      description: "Instant help through our automated Telegram support bot.",
    },
  ];

  return (
      <section className="bg-black py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              🔄 Latest SPC System Updates
            </h2>
            <p className="text-[#f1e3c0] text-base max-w-2xl mx-auto">
              Your SPC platform just got even better. More powerful earnings, smarter tools, and clearer systems for maximum benefit.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {updates.map((item, index) => (
                <div
                    key={index}
                    className="bg-[#1a1a1a] border border-yellow-600 rounded-xl p-6 text-center hover:shadow-yellow-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-[#d4c59a]">{item.description}</p>
                </div>
            ))}
          </div>

          {/* Download Marketing Resources Button */}
          <div className="mt-16 text-center">
            <a
                href="https://SolanaP2PConnect.com/media/sp2pc.zip"
                className="inline-flex items-center gap-3 px-6 py-3 text-black font-semibold bg-yellow-400 hover:bg-yellow-500 rounded-full text-lg shadow-md hover:shadow-yellow-400/40 transition-all"
                download
            >
              <FaDownload />
              Click here to download marketing resources
            </a>
            <p className="text-sm text-[#f1e3c0] mt-2">
              Includes SPC videos, flyers, and promo PDFs.
            </p>
          </div>
        </div>
      </section>
  );
}

const footerData = {
  companyInfo: {
    description:
      "SOLANAP2P Trading is a peer-to-peer digital asset trading and exchange platform that connects buyers and sellers worldwide.",
  },
  quickLinks: [
    { label: "Home", href: "#" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Services", href: "#services" },
    { label: "Features", href: "#features" },
    { label: "FAQs", href: "#faqs" },
    { label: "Contact Us", href: "#" },
  ],
  legalLinks: [
    "Terms of Service",
    "Privacy Policy",
    "Cookie Policy",
    "Risk Disclosure",
    "AML Policy",
  ],
  newsletter: {
    description:
      "Subscribe to our newsletter to receive updates and news about our platform.",
    placeholder: "Your email address",
    buttonText: "Subscribe",
  },
  footerBottom: {
    copyright: `© ${new Date().getFullYear()} SOLANAP2P Trading. All rights reserved.`,
    additionalLinks: ["Support", "Security", "Careers"],
  },
};

function Footer() {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:place-items-center place-content-center lg:grid-cols-3 gap-8 mb-12">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <p className="font-bold text-3xl">SOLANAP2P</p>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              {footerData.companyInfo.description}
            </p>
          </div>

          {/* Quick Links */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerData.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Legal */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerData.legalLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-primary transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between lg:items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {footerData.footerBottom.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const HowItWorksSection = () => {
  const steps = [
    {
      title: "Register Your Account",
      description:
          "Register using the referral link of your sponsor or visit SolanaP2PConnect.com",
      icon: "📝",
    },
    {
      title: "You Bid From $20 (min) - $3000 (max)",
      description:
          "Once you register, you can bid – starting from just $10 to $3000 USDT using Binance Smart Chain Network (BEP20)",
      icon: "🔄",
    },
    {
      title: "Telegram Bot",
      description:
          "Smart AI Telegram bot keeps you in control 24/7",
      icon: "🤖",
    },
    {
      title: "Paired To Receive",
      description:
          "In 30 days, you REBID the same amount, then ASK to receive double your bid (100%)",
      icon: "💰",
    },
    {
      title: "Bidding & Rebidding",
      description:
          "Bidding, Rebidding & Asking opens twice daily:\n* 10 am - 10:30 am CET\n* 10 pm - 10:30 pm CET",
      icon: "🕒",
    },
    {
      title: "Commission",
      description:
          "Earn referral commissions from Level 1 to Level 3 every time your referrals rebid",
      icon: "📈",
    },
    {
      title: "Minimum Withdrawal",
      description:
          "$10 minimum withdrawal threshold",
      icon: "💸",
    },
  ];

  return (
      <section className="py-20 bg-white text-gray-800" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Getting started with SOLANAP2P is quick, secure, and designed for your success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {steps.map((step, index) => (
                <div
                    key={index}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition duration-300"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-2xl mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line text-sm">{step.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
};

