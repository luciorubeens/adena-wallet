import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import Button, { ButtonHierarchy } from '@components/buttons/button';
import TitleWithDesc from '@components/title-with-desc';
import Text from '@components/text';
import { useLocation, useNavigate } from 'react-router-dom';
import { RoutePath } from '@router/path';
import { useRecoilState } from 'recoil';
import { WalletState } from '@states/index';
import { useWalletContext } from '@hooks/use-context';

const text = {
  title: 'You’re All Set!',
  desc: 'Click on the Start button to\nlaunch Adena.',
};

const popupStyle = css`
  ${({ theme }) => theme.mixins.flexbox('column', 'center', 'flex-start')};
  max-width: 380px;
  min-height: 514px;
  padding-top: 50px;
`;

const defaultStyle = css`
  ${({ theme }) => theme.mixins.flexbox('column', 'center', 'space-between')};
  width: 100%;
  height: 100%;
  padding-top: 50px;
`;

const Wrapper = styled.main<{ isPopup: boolean }>`
  ${({ isPopup }) => (isPopup ? popupStyle : defaultStyle)};
`;

interface LaunchAdenaState {
  type: 'SEED' | 'LEDGER' | 'GOOGLE' | 'NONE';
}

export const LaunchAdena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { initWallet } = useWalletContext();
  const [clicked, setClicked] = useState(false);

  const handleNextButtonClick = () => {
    if (clicked) {
      return;
    }
    setClicked(true);
    const locationState: LaunchAdenaState = location.state;
    if (locationState.type === 'GOOGLE' || locationState.type === 'LEDGER') {
      window.close();
    }
    initWallet().then(() => {
      navigate(RoutePath.Wallet);
      setClicked(false);
    })
  };

  return (
    <Wrapper isPopup={location?.state?.type !== 'SEED'}>
      <TitleWithDesc title={text.title} desc={text.desc} />
      <Button
        fullWidth
        hierarchy={ButtonHierarchy.Primary}
        onClick={handleNextButtonClick}
        margin='auto 0px 0px'
      >
        <Text type='body1Bold'>Start</Text>
      </Button>
    </Wrapper>
  );
};
