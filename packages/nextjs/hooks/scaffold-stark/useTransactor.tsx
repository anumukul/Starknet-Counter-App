import { useAccount } from "~~/hooks/useAccount";
import {
  AccountInterface,
  InvokeFunctionResponse,
  constants,
  Call,
  ETransactionVersion,
} from "starknet";
import { getBlockExplorerTxLink, notification } from "~~/utils/scaffold-stark";
import { useTargetNetwork } from "./useTargetNetwork";
import { useState, useEffect } from "react";
import {
  useSendTransaction,
  UseSendTransactionResult,
  useTransactionReceipt,
  UseTransactionReceiptResult,
} from "@starknet-react/core";

type TransactionFunc = (
  tx: Call[],
  withSendTransaction?: boolean,
) => Promise<string | undefined>;

interface UseTransactorReturn {
  writeTransaction: TransactionFunc;
  transactionReceiptInstance: UseTransactionReceiptResult;
  sendTransactionInstance: UseSendTransactionResult;
}

const TxnNotification = ({
  message,
  blockExplorerLink,
}: {
  message: string;
  blockExplorerLink?: string;
}) => {
  return (
    <div className={`flex flex-col ml-1 cursor-default`}>
      <p className="my-0">{message}</p>
      {blockExplorerLink && blockExplorerLink.length > 0 ? (
        <a
          href={blockExplorerLink}
          target="_blank"
          rel="noreferrer"
          className="block link text-md"
        >
          check out transaction
        </a>
      ) : null}
    </div>
  );
};

export const useTransactor = (
  _walletClient?: AccountInterface,
): UseTransactorReturn => {
  let walletClient = _walletClient;
  const { account, address, status } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  if (walletClient === undefined && account) {
    walletClient = account;
  }
  const sendTransactionInstance = useSendTransaction({});

  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [blockExplorerTxURL, setBlockExplorerTxURL] = useState<
    string | undefined
  >(undefined);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  );
  const transactionReceiptInstance = useTransactionReceipt({
    hash: transactionHash,
    enabled: !!transactionHash,
    watch: true,
  });
  const { data: txResult, status: txStatus } = transactionReceiptInstance;

  const resetStates = () => {
    setTransactionHash(undefined);
    setBlockExplorerTxURL(undefined);
  };

  useEffect(() => {
    if (notificationId && txStatus && txStatus !== "pending") {
      notification.remove(notificationId);
    }
    if (txStatus === "success") {
      notification.success(
        <TxnNotification
          message="Transaction completed successfully!"
          blockExplorerLink={blockExplorerTxURL}
        />,
        {
          icon: "🎉",
        },
      );
      resetStates();
    }
  }, [txResult]);

  const writeTransaction = async (
    tx: Call[],
    withSendTransaction: boolean = true,
  ): Promise<string | undefined> => {
    resetStates();
    if (!walletClient) {
      notification.error("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let notificationId = null;
    let transactionHash:
      | Awaited<InvokeFunctionResponse>["transaction_hash"]
      | undefined = undefined;
    try {
      const networkId = await walletClient.getChainId();
      notificationId = notification.loading(
        <TxnNotification message="Awaiting for user confirmation" />,
      );
      
      if (tx != null && withSendTransaction) {
        // Use starknet-react's sendTransaction for better compatibility
        const result = await sendTransactionInstance.sendAsync(tx);
        if (typeof result === "string") {
          transactionHash = result;
        } else {
          transactionHash = result.transaction_hash;
        }
      } else if (tx != null) {
        try {
          // Simplified transaction execution without complex fee estimation
          const txOptions = {
            version: ETransactionVersion.V3,
            // Use reasonable default values that work on devnet
            maxFee: "0x16345785d8a0000", // 0.1 ETH in wei (reasonable for devnet)
          };

          transactionHash = (await walletClient.execute(tx, txOptions))
            .transaction_hash;
        } catch (executionError: any) {
          console.warn("Direct execution failed, trying with minimal options:", executionError);
          
          // Fallback: Execute with minimal options
          try {
            transactionHash = (await walletClient.execute(tx))
              .transaction_hash;
          } catch (fallbackError: any) {
            console.error("All execution methods failed:", fallbackError);
            throw fallbackError;
          }
        }
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }

      setTransactionHash(transactionHash);

      notification.remove(notificationId);

      const blockExplorerTxURL = networkId
        ? getBlockExplorerTxLink(targetNetwork.network, transactionHash)
        : "";
      setBlockExplorerTxURL(blockExplorerTxURL);

      notificationId = notification.loading(
        <TxnNotification
          message="Waiting for transaction to complete."
          blockExplorerLink={blockExplorerTxURL}
        />,
      );
      setNotificationId(notificationId);
    } catch (error: any) {
      if (notificationId) {
        notification.remove(notificationId);
      }

      // Better error message extraction
      let message = error.message || "Transaction failed";
      
      // Extract meaningful error messages
      if (message.includes("ContractError")) {
        const contractMatch = message.match(/ContractError\((.*?)\)/);
        if (contractMatch) {
          message = contractMatch[1];
        }
      } else if (message.includes("execution_status")) {
        message = "Transaction execution failed";
      } else if (message.includes("insufficient")) {
        message = "Insufficient balance for transaction";
      } else if (message.includes("allowance")) {
        message = "Insufficient allowance for transfer";
      }

      console.error("⚡️ ~ file: useTransactor.tsx ~ error", message);
      notification.error(message);
      throw error;
    }

    return transactionHash;
  };

  return {
    writeTransaction,
    transactionReceiptInstance,
    sendTransactionInstance,
  };
};