import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import {
  RESUME_OPENING,
  continueResume,
  createResumeSession,
  nextResumeTurn,
} from '@/lib/resume-engine';
import { buildResumePdf, downloadResumePdf, resumeFileName } from '@/lib/resume-pdf';
import type { ResumeDocument, ResumeSession, RoleItem } from '@/lib/resume-types';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type Message = { id: string; from: 'coach' | 'you'; text: string };

export default function ResumeAssistantScreen() {
  const [session, setSession] = useState<ResumeSession>(createResumeSession);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm0', from: 'coach', text: RESUME_OPENING },
  ]);
  const [draft, setDraft] = useState('');
  const [document, setDocument] = useState<ResumeDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!document) scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, document]);

  const ready = Boolean(document);

  const publishPdf = async (nextDoc: ResumeDocument) => {
    setDocument(nextDoc);
    setBusy(true);
    setError('');
    try {
      await buildResumePdf(nextDoc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the PDF.');
    } finally {
      setBusy(false);
    }
  };

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setDraft('');
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'you', text: value };
    const result = nextResumeTurn(session, value);
    setSession(result.session);
    setMessages((list) => [
      ...list,
      userMsg,
      { id: `c-${Date.now()}`, from: 'coach', text: result.reply },
    ]);
    if (result.document) await publishPdf(result.document);
  };

  const skip = () => send('skip');

  const restart = () => {
    setSession(createResumeSession());
    setMessages([{ id: 'm0', from: 'coach', text: RESUME_OPENING }]);
    setDocument(null);
    setError('');
  };

  const onDownload = async () => {
    if (!document) return;
    setBusy(true);
    setError('');
    try {
      const bytes = await buildResumePdf(document);
      await downloadResumePdf(bytes, resumeFileName(document));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download the PDF.');
    } finally {
      setBusy(false);
    }
  };

  const onRegenerate = async () => {
    if (!document) return;
    await publishPdf(document);
  };

  const addMore = () => {
    const next = continueResume(session);
    setSession(next.session);
    setMessages((list) => [...list, { id: `c-${Date.now()}`, from: 'coach', text: next.reply }]);
  };

  return (
    <Screen>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resume Assistant</Text>
        <Text style={styles.lede}>
          Answer in plain language. This helper stays on-device, expands what you actually did into resume wording, and never invents numbers or awards.
        </Text>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.from === 'you' ? styles.you : styles.coach]}>
            <Text style={styles.bubbleText}>{message.text}</Text>
          </View>
        ))}

        {ready && document ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewLabel}>Resume preview</Text>
            <ResumePaper document={document} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              label={busy ? 'Working…' : 'Download Resume'}
              onPress={onDownload}
              disabled={busy}
            />
            <View style={styles.row}>
              <PrimaryButton label="Regenerate PDF" tone="blue" style={{ flex: 1 }} onPress={onRegenerate} disabled={busy} />
              <PrimaryButton label="Add more" tone="cream" style={{ flex: 1 }} onPress={addMore} />
            </View>
            <ResumeEditor document={document} onChange={setDocument} />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.controls}>
        {session.step.id !== 'done' ? (
          <>
            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type your answer"
                placeholderTextColor={colors.prototype}
                style={styles.input}
                onSubmitEditing={() => send(draft)}
                returnKeyType="send"
              />
              <Pressable onPress={() => send(draft)} style={styles.send} accessibilityRole="button">
                <Text style={styles.sendText}>Send</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              {session.optional ? (
                <PrimaryButton label="Skip" tone="cream" style={{ flex: 1 }} onPress={skip} />
              ) : null}
              <PrimaryButton label="Start over" tone="cream" style={{ flex: 1 }} onPress={restart} />
            </View>
          </>
        ) : (
          <PrimaryButton label="Start over" tone="cream" onPress={restart} />
        )}
      </View>
    </Screen>
  );
}

function ResumePaper({ document }: { document: ResumeDocument }) {
  return (
    <View style={styles.paper}>
      <Text style={styles.paperName}>{document.name}</Text>
      <Text style={styles.paperContact}>
        {[document.address, document.email, document.phone].filter(Boolean).join('  •  ')}
      </Text>
      {document.summary ? (
        <>
          <Text style={styles.paperH}>Summary</Text>
          <Text style={styles.paperP}>{document.summary}</Text>
        </>
      ) : null}
      {document.education.map((ed) => (
        <View key={ed.school} style={styles.paperRole}>
          <Text style={styles.paperH}>Education</Text>
          <View style={styles.paperHead}>
            <Text style={styles.paperTitle}>
              {[ed.school, ed.location].filter(Boolean).join(', ')}
            </Text>
            {ed.graduation ? <Text style={styles.paperDates}>{ed.graduation}</Text> : null}
          </View>
          {ed.details ? <Text style={styles.paperP}>{ed.details}</Text> : null}
        </View>
      ))}
      <RoleSection title="Experience" roles={document.experience} />
      <RoleSection title="Projects" roles={document.projects} />
      <RoleSection title="Leadership & Activities" roles={document.leadership} />
      <RoleSection title="Volunteer Experience" roles={document.volunteer} />
      {document.skills.length ? (
        <>
          <Text style={styles.paperH}>Skills</Text>
          <Text style={styles.paperP}>{document.skills.join('  •  ')}</Text>
        </>
      ) : null}
    </View>
  );
}

function RoleSection({ title, roles }: { title: string; roles: RoleItem[] }) {
  if (!roles.length) return null;
  return (
    <View>
      <Text style={styles.paperH}>{title}</Text>
      {roles.map((role) => (
        <View key={role.id} style={styles.paperRole}>
          <View style={styles.paperHead}>
            <Text style={styles.paperTitle}>
              {[role.title, role.organization].filter(Boolean).join(', ')}
            </Text>
            {role.dates ? <Text style={styles.paperDates}>{role.dates}</Text> : null}
          </View>
          {role.bullets.map((bullet) => (
            <Text key={bullet} style={styles.paperBullet}>
              • {bullet}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function ResumeEditor({
  document,
  onChange,
}: {
  document: ResumeDocument;
  onChange: (doc: ResumeDocument) => void;
}) {
  const setField = (patch: Partial<ResumeDocument>) => onChange({ ...document, ...patch });
  const bumpRole = (key: 'experience' | 'projects' | 'leadership' | 'volunteer', id: string, bullets: string) => {
    onChange({
      ...document,
      [key]: document[key].map((role) =>
        role.id === id ? { ...role, bullets: bullets.split('\n').map((b) => b.replace(/^•\s*/, '').trim()).filter(Boolean) } : role,
      ),
    });
  };

  return (
    <View style={styles.editor}>
      <Text style={styles.previewLabel}>Edit and regenerate</Text>
      <Field label="Full name" value={document.name} onChangeText={(name) => setField({ name })} />
      <Field label="Address" value={document.address ?? ''} onChangeText={(address) => setField({ address })} />
      <Field label="Email" value={document.email ?? ''} onChangeText={(email) => setField({ email })} />
      <Field label="Phone" value={document.phone ?? ''} onChangeText={(phone) => setField({ phone })} />
      <Field
        label="Summary"
        value={document.summary ?? ''}
        onChangeText={(summary) => setField({ summary })}
        multiline
      />
      {(['experience', 'projects', 'leadership', 'volunteer'] as const).map((key) =>
        document[key].map((role) => (
          <Field
            key={role.id}
            label={`${role.title}${role.organization ? `, ${role.organization}` : ''}`}
            value={role.bullets.join('\n')}
            onChangeText={(value) => bumpRole(key, role.id, value)}
            multiline
          />
        )),
      )}
      <Field
        label="Skills (comma or line separated)"
        value={document.skills.join('\n')}
        onChangeText={(value) =>
          setField({
            skills: value
              .split(/[,•\n]/)
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        multiline
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.fieldInput, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  coach: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mutedBlue,
  },
  you: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
  },
  bubbleText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  controls: {
    padding: spacing.lg,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.mutedBlue,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    color: colors.brown,
  },
  send: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.blue,
    justifyContent: 'center',
  },
  sendText: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBlock: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  previewLabel: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.brown,
  },
  paper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 6,
  },
  paperName: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  paperContact: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.ink,
    textAlign: 'center',
  },
  paperH: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    color: colors.ink,
    textTransform: 'uppercase',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 2,
  },
  paperP: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
  },
  paperRole: {
    gap: 2,
    marginBottom: 6,
  },
  paperHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paperTitle: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    color: colors.ink,
    flex: 1,
  },
  paperDates: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.ink,
  },
  paperBullet: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
    paddingLeft: 6,
  },
  editor: {
    gap: spacing.sm,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    color: colors.brown,
  },
  fieldInput: {
    minHeight: 44,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  multiline: {
    minHeight: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.brown,
    textAlign: 'center',
  },
});
