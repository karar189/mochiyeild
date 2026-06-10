import { Bebas_Neue, Inter, Open_Sans } from 'next/font/google'

export const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
})

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})
