import React from 'react';
import useIsMounted from '../../hooks/useIsMounted';

import {
  TextContainer,
} from './styles';
import { routes, useContext } from '../AlephiumConnect';
import { AnimatePresence, Variants } from 'framer-motion';
import ThemedButton, { ThemeContainer } from '../Common/ThemedButton';
import { ResetContainer } from '../../styles';
import { useAccount } from '../../hooks/useAccount';
import { truncatedAddress } from '../../utils';
import { Account } from '@alephium/web3';

const contentVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: '-100%',
  },
  animate: {
    opacity: 1,
    x: 0.1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    zIndex: 1,
    opacity: 0,
    x: '-100%',
    pointerEvents: 'none',
    position: 'absolute',
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const addressVariants: Variants = {
  initial: {
    zIndex: 2,
    opacity: 0,
    x: '100%',
  },
  animate: {
    x: 0.2,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    zIndex: 1,
    x: '100%',
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const textVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    position: 'absolute',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

type ConnectButtonRendererProps = {
  displayAccount: (account: Account) => string
  children?: (renderProps: {
    show?: () => void;
    hide?: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    address?: string;
    truncatedAddress?: string;
  }) => React.ReactNode;
};

const ConnectButtonRenderer: React.FC<ConnectButtonRendererProps> = ({
  displayAccount,
  children,
}) => {
  const isMounted = useIsMounted();
  const context = useContext();

  const { account } = useAccount(context.network)
  const isConnected = false
  const isConnecting = false

  function hide() {
    context.setOpen(false);
  }

  function show() {
    context.setOpen(true);
    context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS);
  }

  if (!children) return null;
  if (!isMounted) return null;

  const displayAddress = account ? displayAccount(account) : undefined

  return (
    <>
      {children({
        show,
        hide,
        isConnected: !!account,
        isConnecting: isConnecting,
        address: displayAddress,
        truncatedAddress: displayAddress ? truncatedAddress(displayAddress) : undefined,
      })}
    </>
  );
};

ConnectButtonRenderer.displayName = 'AlephiumConnectButton.Custom';

function AlephiumConnectButtonInner({
  label,
  displayAccount
}: {
  label?: string;
  separator?: string;
  displayAccount: (account: Account) => string
}) {
  const context = useContext()
  const { account } = useAccount(context.network);

  return (
    <AnimatePresence initial={false}>
      {!!account ? (
        <TextContainer
          key="connectedText"
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={addressVariants}
          style={{
            height: 40,
          }}
        >

          <div
            style={{
              position: 'relative',
              paddingRight: 0,
            }}
          >
            <AnimatePresence initial={false}>
              <TextContainer
                key="ckTruncatedAddress"
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={textVariants}
                style={{
                  position: 'relative',
                }}
              >
                {truncatedAddress(displayAccount(account))}
              </TextContainer>
            </AnimatePresence>
          </div>
        </TextContainer>
      ) : (
        <TextContainer
          key="connectWalletText"
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={contentVariants}
          style={{
            height: 40,
            //padding: '0 5px',
          }}
        >
          {label ? label : "Connect Alephium"}
        </TextContainer>
      )}
    </AnimatePresence>
  );
}

type AlephiumConnectButtonProps = {
  // Options
  label?: string;

  // Events
  onClick?: (open: () => void) => void;

  displayAccount?: (account: Account) => string
};

export function AlephiumConnectButton({
  label,
  onClick,
  displayAccount
}: AlephiumConnectButtonProps) {
  const isMounted = useIsMounted();

  const context = useContext();
  const { isConnected } = useAccount(context.network, () => {
    return Promise.resolve()
  })

  function show() {
    context.setOpen(true);
    context.setRoute(isConnected ? routes.PROFILE : routes.CONNECTORS);
  }

  if (!isMounted) return null;

  return (
    <ResetContainer
      $useTheme={context.theme}
      $useMode={context.mode}
      $customTheme={context.customTheme}
    >
      <ThemeContainer
        onClick={() => {
          if (onClick) {
            onClick(show);
          } else {
            show();
          }
        }}
      >
        <ThemedButton
          style={
            {
              overflow: 'hidden',
            }
          }
        >
          <AlephiumConnectButtonInner
            label={label}
            displayAccount={displayAccount ?? ((account: Account) => account.address)}
          />
        </ThemedButton>
      </ThemeContainer>
    </ResetContainer>
  );
}

AlephiumConnectButton.Custom = ConnectButtonRenderer;
