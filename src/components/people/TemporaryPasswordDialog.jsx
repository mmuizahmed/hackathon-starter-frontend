import { useState } from "react";
import { Button, FormAlert, Input, Modal } from "../ui";

export function TemporaryPasswordDialog({ open, title, message, email, password, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function onCopy() {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(password || "");
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyError("Copy was blocked. Select the password and copy it yourself.");
    }
  }

  return (
    <Modal
      open={open}
      title={title || "Temporary password"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onCopy}>
            {copied ? "Copied" : "Copy password"}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {message || "This password is shown once. The person must change it at the next sign-in."}
        </p>
        {email ? <p className="text-sm text-zinc-800 dark:text-zinc-100">{email}</p> : null}
        <Input label="Temporary password" name="temporaryPassword" value={password || ""} readOnly onFocus={(event) => event.target.select()} />
        {copyError ? <FormAlert message={copyError} /> : null}
      </div>
    </Modal>
  );
}
