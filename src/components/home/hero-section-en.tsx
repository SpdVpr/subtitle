import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Gift,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Languages,
  Star,
  Globe,
} from "lucide-react";

export function HeroSectionEn() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-card dark:to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container px-4 py-24 mx-auto text-center relative">
        <div className="max-w-5xl mx-auto">
          {/* Free Credits Badge */}
          <Link href="/register" className="inline-block">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">🎉 New users get 100 FREE credits to start!</span>
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            AI-Powered Subtitle Translation
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Translate your subtitles with our <span className="font-semibold text-blue-600 dark:text-primary">proprietary AI engine</span> that combines
            <span className="font-semibold text-purple-600 dark:text-primary"> OpenAI + Context Research</span> for maximum translation quality.
          </p>

          {/* Key Features Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              100+ Language Pairs
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Context-Aware AI
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              No Subscriptions
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Credits Never Expire
            </Badge>
          </div>

          {/* Live Translation Demo */}
          <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-10 max-w-4xl mx-auto shadow-xl dark:bg-card/80 dark:border-border dark:backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Languages className="h-5 w-5 text-blue-600 dark:text-primary" />
              <span className="font-semibold text-gray-800 dark:text-card-foreground">See Translation in Action</span>
            </div>

            {/* Translation Demo */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Original English */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">EN</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original English</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">This algorithm looks impossible to solve.</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">It's a piece of cake for David.</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">He's been coding since he was twelve.</div>
                  </div>
                </div>
              </div>

              {/* Arrow - Desktop */}
              <div className="hidden lg:flex items-center justify-center px-4">
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-8 w-8 text-blue-500 dark:text-primary animate-pulse" />
                  <span className="text-xs text-blue-600 dark:text-primary font-medium mt-1">AI Translation</span>
                </div>
              </div>

              {/* Arrow - Mobile/Tablet */}
              <div className="lg:hidden flex items-center justify-center py-4 w-full">
                <div className="flex items-center">
                  <ArrowDown className="h-6 w-6 text-blue-500 dark:text-primary animate-bounce" />
                  <span className="text-xs text-blue-600 dark:text-primary font-medium ml-2">AI Translation</span>
                </div>
              </div>

              {/* Translated Czech */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CZ</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Translated Czech</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                    <div className="text-sm text-gray-800 dark:text-blue-200">Tento algoritmus vypadá neřešitelně.</div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                    <div className="text-sm text-gray-800 dark:text-blue-200">Pro Davida je to hračka.</div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                    <div className="text-sm text-gray-800 dark:text-blue-200">Programuje už od dvanácti let.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                <span className="font-medium text-blue-600 dark:text-primary">Perfect timing preserved</span> •
                <span className="font-medium text-green-600 dark:text-green-400"> Natural translations</span> •
                <span className="font-medium text-purple-600 dark:text-purple-400"> 40+ languages supported</span>
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg" asChild>
              <Link href="/translate" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start Translating FREE
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing" className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                View Credit Packages
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm">Premium AI Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <span className="text-sm">Instant Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Global Language Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

