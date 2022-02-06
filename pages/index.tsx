import React from 'react'
import { AppLayout } from '../components/Layout/AppLayout'
import { TokenSwap } from '../features/swap'
import { PageHeader } from '../components/Layout/PageHeader'
import { styled } from 'components/theme'

export default function Home() {
  return (
    <AppLayout>
      <StyledContainer>
        <PageHeader
          title="Swap"
          subtitle="DIOCaNE."
        />
        <TokenSwap />
      </StyledContainer>
    </AppLayout>
  )
}

const StyledContainer = styled('div', {
  maxWidth: '53.75rem',
  margin: '0 auto',
})
