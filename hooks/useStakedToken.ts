import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL } from 'util/constants'
import {
  getClaims,
  getStakedBalance,
  getTotalStakedBalance,
  getUnstakingDuration,
} from 'services/staking'
import { convertMicroDenomToDenom } from 'util/conversion'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChainInfo } from './useChainInfo'
import {
  useBaseTokenInfo,
  useTokenInfo,
  useTokenInfoByPoolId,
} from './useTokenInfo'
import { useSwapInfo } from './useSwapInfo'
import { useTokenDollarValue } from './useTokenDollarValue'

export const useGetPoolTokensDollarValue = ({
  poolId,
  tokenAmountInMicroDenom,
}) => {
  const tokenA = useBaseTokenInfo()

  const [swapInfo, isLoading] = useSwapInfo({ poolId })
  const [junoPrice, isPriceLoading] = useTokenDollarValue(tokenA.symbol)

  if (swapInfo) {
    return [
      convertMicroDenomToDenom(
        (tokenAmountInMicroDenom / swapInfo.lp_token_supply) *
          swapInfo.token1_reserve *
          junoPrice *
          2,
        6
      ),
      isLoading || isPriceLoading,
    ]
  }

  return [0, isLoading || isPriceLoading]
}

export const useStakedTokenBalance = ({ poolId }) => {
  const { address, status, client } = useRecoilValue(walletState)

  const token = useTokenInfoByPoolId(poolId)

  const { data = 0, isLoading } = useQuery<number>(
    [`stakedTokenBalance/${poolId}`, address],
    async () => {
      return Number(
        await getStakedBalance(address, token.staking_address, client)
      )
    },
    {
      enabled: Boolean(
        token?.staking_address && status === WalletStatusType.connected
      ),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    }
  )

  return [data, isLoading] as const
}

export const useTotalStaked = ({ poolId }) => {
  const token = useTokenInfo(poolId)
  const [chainInfo] = useChainInfo()

  const { data = 0, isLoading } = useQuery(
    `totalStaked/${poolId}`,
    async () => {
      const client = await CosmWasmClient.connect(chainInfo.rpc)
      return convertMicroDenomToDenom(
        await getTotalStakedBalance(token.staking_address, client),
        6
      )
    },
    {
      enabled: Boolean(token?.staking_address && chainInfo?.rpc),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    }
  )

  return [data, isLoading] as const
}

export const useGetClaims = ({ poolId }) => {
  const token = useTokenInfo(poolId)
  const { address, status, client } = useRecoilValue(walletState)

  const { data = [], isLoading } = useQuery(
    [`claims/${poolId}`, address],
    async () => {
      return getClaims(address, token.staking_address, client)
    },
    {
      enabled: Boolean(
        token?.staking_address && status === WalletStatusType.connected
      ),
      refetchOnMount: 'always',
      refetchInterval: DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    }
  )
  return [data, isLoading] as const
}

export const useUnstakingDuration = ({ poolId }) => {
  const token = useTokenInfo(poolId)
  const [chainInfo] = useChainInfo()

  const { data = 0, isLoading } = useQuery(
    `unstakingDuration/${poolId}`,
    async () => {
      const client = await CosmWasmClient.connect(chainInfo.rpc)
      return getUnstakingDuration(token?.staking_address, client)
    },
    {
      enabled: Boolean(
        token?.staking_address && status === WalletStatusType.connected
      ),
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  )

  return [data, isLoading] as const
}
