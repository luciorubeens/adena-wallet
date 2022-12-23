import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Text from '@components/text';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '@router/path';
import LoadingWallet from '@components/loading-screen/loading-wallet';
import DubbleButton from '@components/buttons/double-button';
import ListBox from '@components/list-box';
import { useWalletBalances } from '@hooks/use-wallet-balances';
import { useWallet } from '@hooks/use-wallet';
import { useWalletAccounts } from '@hooks/use-wallet-accounts';
import { maxFractionDigits } from '@common/utils/client-utils';
import { useGnoClient } from '@hooks/use-gno-client';
import { useCurrentAccount } from '@hooks/use-current-account';
import { useRecoilState } from 'recoil';
import { WalletState } from '@states/index';
import { useTransactionHistory } from '@hooks/use-transaction-history';

const Wrapper = styled.main`
  padding-top: 14px;
  text-align: center;
`;

export const WalletMain = () => {
  const navigate = useNavigate();
  const DepositButtonClick = () => navigate(RoutePath.WalletSearch, { state: 'deposit' });
  const SendButtonClick = () => navigate(RoutePath.WalletSearch, { state: 'send' });
  const CoinBoxClick = () => navigate(RoutePath.TokenDetails);
  const [wallet, state] = useWallet();
  const [gnoClient] = useGnoClient();
  const { initAccounts } = useWalletAccounts(wallet);
  const [balances, updateBalances] = useWalletBalances();
  const [currentAccount] = useCurrentAccount();
  const [currentBalance, setCurrentBalance] = useRecoilState(WalletState.currentBalance);
  const [tokenConfig] = useRecoilState(WalletState.tokenConfig);
  const [, updateLastHistory] = useTransactionHistory();

  useEffect(() => {
    if (gnoClient && state === 'FINISH') {
      initAccounts();
    }
  }, [state, gnoClient]);

  useEffect(() => {
    if (currentAccount?.getAddress()) {
      updateBalances();
      updateLastHistory();
    }
  }, [currentAccount?.getAddress()])

  useEffect(() => {
    if (balances && balances.length > 0) {
      if (balances[0].amountDenom.toUpperCase() === balances[0].denom.toUpperCase()) {
        setCurrentBalance({
          amount: balances[0].amount,
          denom: balances[0].amountDenom.toUpperCase()
        });
      }
    }
  }, [balances]);

  const getCurrentBalance = () => {
    if (!currentBalance.denom) {
      return null;
    }
    return `${maxFractionDigits(currentBalance.amount, 6)}\n${currentBalance.denom}`
  };

  return (
    <>
      {getCurrentBalance() && state === 'FINISH' ? (
        <Wrapper>
          <Text type='header2' textAlign='center'>
            {getCurrentBalance()}
          </Text>
          <DubbleButton
            margin='14px 0px 30px'
            leftProps={{ onClick: DepositButtonClick, text: 'Deposit' }}
            rightProps={{
              onClick: SendButtonClick,
              text: 'Send',
            }}
          />
          {
            tokenConfig.map((item, index) => (
              <ListBox
                left={<img src={item.imageData} alt='logo image' />}
                center={<Text type='body1Bold'>{item.name || ''}</Text>}
                right={
                  <Text type='body2Reg'>
                    {`${maxFractionDigits(balances.find(balance => balance.denom === item.denom)?.amount ?? 0, 6)} ${item.type ?? ''}`}
                  </Text>
                }
                hoverAction={true}
                gap={12}
                key={index}
                onClick={CoinBoxClick}
              />
            ))}
        </Wrapper>
      ) : (
        <LoadingWallet />
      )}
    </>
  );
};