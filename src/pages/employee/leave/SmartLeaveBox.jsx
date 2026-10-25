import { useState } from "react";
import { Button, Card, Textarea } from "../../../components/ui";
import { AiMarkdown } from "../../../features/assistant/AiMarkdown";
import { parseSmartLeave } from "../../../features/assistant/api";
import { assistantProblem, smartLeaveDraft } from "../../../features/assistant/messages";

export function SmartLeaveBox({ onDraft }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (loading) return;
    if (!text.trim()) {
      setNote("Describe the leave in a sentence. The form below stays available.");
      return;
    }

    setLoading(true);
    setNote("");
    try {
      const data = await parseSmartLeave({ text: text.trim() });
      const draft = smartLeaveDraft(data);
      if (!draft) {
        const reason = data?.message || assistantProblem(null, data) || "The assistant could not fill this in.";
        setNote(`${reason} You can still use the form below.`);
        return;
      }
      onDraft(draft);
    } catch (error) {
      setNote(`${assistantProblem(error)} You can still use the form below.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Smart leave">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Textarea
          name="smartLeave"
          label="Describe your leave in plain words"
          placeholder="Need next Monday and Tuesday off for a wedding. Example: agle somwar aur mangal behen ki shaadi hai"
          value={text}
          rows={3}
          onChange={(event) => setText(event.target.value)}
        />
        {note ? <AiMarkdown text={note} /> : null}
        <Button type="submit" variant="secondary" loading={loading}>
          Fill the form
        </Button>
      </form>
    </Card>
  );
}
