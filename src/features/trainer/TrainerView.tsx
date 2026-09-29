/**
 * The study screen body: board + status panel. Used by both normal study and
 * the alarm session; the parent decides what happens when the line ends.
 *
 * Remount it (change its `key`) to restart a session.
 */
import { Ionicons } from '@expo/vector-icons';
import { useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Chessboard } from '@/components/board/Chessboard';
import { Card, ProgressBar, SideBadge } from '@/components/ui';
import { MODE_LABELS, type Opening, type OpeningLine, type TrainerMode } from '@/domain/types';
import { useSettingsStore } from '@/store/settingsStore';
import { BOARD_MAX_WIDTH, colors, radius, spacing, typography } from '@/theme';
import { BOARD_THEMES } from '@/theme/boardThemes';
import { MoveList } from './MoveList';
import { useTrainerSession, type SessionResult } from './useTrainerSession';

interface TrainerViewProps {
  opening: Opening;
  line: OpeningLine;
  mode: TrainerMode;
  /** Actions to show once the line is finished. */
  renderComplete: (result: SessionResult) => ReactNode;
  /** Actions shown while in progress (e.g. "Skip to Level 1"). */
  renderToolbar?: () => ReactNode;
  /** Called on the learner's first interaction (the alarm uses it to stop ringing). */
  onFirstInteraction?: () => void;
}

const WIDE_BREAKPOINT = 900;
const MESSAGE_COLORS = { neutral: colors.textMuted, good: colors.primary, bad: colors.danger, hint: colors.accent };
const MODE_DESCRIPTIONS: Record<TrainerMode, string> = {
  demo: 'Watch the whole line with explanations.',
  guided: 'Play every move with the arrow to guide you.',
  recall: 'Play from memory. Three misses on a move shows a hint.',
};

export function TrainerView({
  opening,
  line,
  mode,
  renderComplete,
  renderToolbar,
  onFirstInteraction,
}: TrainerViewProps) {
  const session = useTrainerSession(opening, line, mode);
  const { width, height } = useWindowDimensions();
  const settings = useSettingsStore();
  const wide = width >= WIDE_BREAKPOINT;
  const boardSize = Math.floor(
    wide
      ? Math.min(BOARD_MAX_WIDTH + 80, height - 140, width * 0.55)
      : Math.min(width - spacing.lg * 2, BOARD_MAX_WIDTH, height * 0.62),
  );

  const interacted = useRef(false);
  const firstInteraction = () => {
    if (interacted.current) return;
    interacted.current = true;
    onFirstInteraction?.();
  };
  const progress = session.state.steps.length ? session.state.ply / session.state.steps.length : 0;
  const hintArrows = session.hint ? [session.hint] : [];
  const demoControls = mode === 'demo' && !session.result;

  const panel = (
    <View style={[styles.panel, wide && styles.panelWide]}>
      <View style={styles.headerRow}>
        <View style={styles.modePill}>
          <Text style={styles.modePillText}>{MODE_LABELS[mode]}</Text>
        </View>
        <SideBadge side={opening.side} />
      </View>
      <View style={{ gap: 2 }}>
        <Text style={styles.opening}>{opening.name}</Text>
        <Text style={styles.line}>{line.name}</Text>
        <Text style={styles.description}>{MODE_DESCRIPTIONS[mode]}</Text>
      </View>

      <ProgressBar value={progress} />

      <Card style={styles.statusCard}>
        <Text
          style={[styles.message, { color: MESSAGE_COLORS[session.message.tone] }]}
          accessibilityLiveRegion="polite"
        >
          {session.message.text}
        </Text>
        {session.note && mode !== 'recall' ? <Text style={styles.note}>{session.note}</Text> : null}
        {mode === 'recall' && session.state.mistakes > 0 && !session.result ? (
          <Text style={styles.mistakes}>
            {session.state.mistakes} {session.state.mistakes === 1 ? 'mistake' : 'mistakes'} — no star this run, but
            finish the line!
          </Text>
        ) : null}
      </Card>

      <MoveList steps={session.state.steps} ply={session.state.ply} revealUpcoming={mode === 'demo'} />

      {demoControls ? (
        <View style={styles.demoControls}>
          <IconButton icon="play-skip-back" label="Previous move" onPress={session.stepBack} />
          <IconButton
            icon={session.autoplay ? 'pause' : 'play'}
            label={session.autoplay ? 'Pause' : 'Play'}
            onPress={() => session.setAutoplay(!session.autoplay)}
            primary
          />
          <IconButton icon="play-skip-forward" label="Next move" onPress={session.stepForward} />
        </View>
      ) : null}

      {session.result ? <View style={styles.complete}>{renderComplete(session.result)}</View> : renderToolbar?.()}
    </View>
  );

  return (
    <View style={[styles.root, wide && styles.rootWide]}>
      <View style={styles.boardWrap}>
        <Chessboard
          fen={session.fen}
          size={boardSize}
          theme={BOARD_THEMES[settings.boardTheme]}
          orientation={opening.side}
          showCoordinates={settings.showCoordinates}
          lastMove={session.lastMove}
          arrows={hintArrows}
          wrong={session.wrongFlash}
          interactive={session.canMove}
          movableColor={opening.side}
          onMove={(from, to) => {
            firstInteraction();
            session.onMove(from, to);
          }}
          onPickUp={() => {
            firstInteraction();
            session.onPickUp();
          }}
          accessibilityLabel={`${opening.name} board`}
        />
      </View>
      {panel}
    </View>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: 'play' | 'pause' | 'play-skip-back' | 'play-skip-forward';
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, primary && styles.iconButtonPrimary, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name={icon} size={22} color={primary ? colors.primaryText : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg, alignItems: 'center' },
  rootWide: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  boardWrap: {
    borderRadius: radius.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  panel: { width: '100%', maxWidth: BOARD_MAX_WIDTH, gap: spacing.md },
  panelWide: { width: 380, maxWidth: 380 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  modePillText: { ...typography.caption, color: colors.primaryText, fontWeight: '800' },
  opening: { ...typography.title, color: colors.text },
  line: { ...typography.bodyStrong, color: colors.textMuted },
  description: { ...typography.caption, color: colors.textFaint, marginTop: 2 },
  statusCard: { gap: spacing.sm, paddingVertical: spacing.md },
  message: { ...typography.heading },
  note: { ...typography.body, color: colors.text, lineHeight: 21 },
  mistakes: { ...typography.caption, color: colors.textMuted },
  demoControls: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  iconButton: {
    width: 52,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPrimary: { backgroundColor: colors.primary, width: 72 },
  complete: { gap: spacing.sm },
});
