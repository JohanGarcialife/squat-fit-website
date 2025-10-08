'use client'
import React from 'react'
import MenuHeader from './MenuHeader'
import Link from 'next/link';
import Image from 'next/image';
import useWindowSize from '@/hooks/UseWindowSize';

export default function Footer() { 
  const { width } = useWindowSize();
  return (
    <>
    
    {width < 1024 ? <Link href="/">
                <Image
                    src="/Logo-horizontal.png"
                    width={210}
                    height={50}
                    alt="Logo"
                />
            </Link> : <MenuHeader />}
    </>
  )
}
