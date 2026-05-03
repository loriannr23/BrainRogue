# UI Extraction Report

Generated: 2026-05-03T00:44:36

## Scope

- Source: `public/assets/pokerogue`
- Output: `public/assets/ui-extracted`
- Important folders scanned: `images/`, `battle-anims/`
- Game code was not modified.
- Note: these are extracted third-party reference assets for local analysis; review licensing/provenance before shipping them.

## Summary

- Candidate UI images found: 1457
- Source images extracted: 220
- Extracted unique image pieces/frames: 885
- Ignored/deferred candidates: 1237

## Detection Rules

- Candidate files are image files under `images/` or `battle-anims/` whose path is inside `ui/` or whose filename/path contains `frame`, `border`, `window`, `box`, `hud`, or `panel`.
- High-value extraction prioritized overlays, party/HUD elements, cursors, selectors, prompt/name boxes, bars, buttons, scroll elements, and compact icons.
- For panel-like images, the extractor exports representative corners, edges, and center/fill tiles.
- For grid-like images, the extractor detects common tile sizes and exports up to the first 64 non-empty frames.

## Extracted Outputs

- Atlas: `public/assets/ui-extracted/ui-map.json`
- 9-slice-like pieces: `public/assets/ui-extracted/slices/`
- Icon/spritesheet frames: `public/assets/ui-extracted/icons/`

## Files Used

- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/inputs/xbox.png` (192x12) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/ability_bar_left.png` (118x31) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/ability_bar_right.png` (118x31) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/achv_bar.png` (92x40) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/achv_bar_2.png` (92x40) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/achv_bar_3.png` (92x40) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/achv_bar_4.png` (92x40) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/achv_bar_5.png` (92x40) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/bgm_bar.png` (118x31) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/bmenu_sel.png` (44x16) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/button_tera.png` (90x84) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/candy.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/candy_overlay.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/cursor.png` (6x10) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/cursor_reverse.png` (6x10) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/cursor_tera.png` (12x15) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dawn_icon_bg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dawn_icon_fg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dawn_icon_mg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/day_icon_bg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/day_icon_fg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/day_icon_mg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/discord_icon.png` (12x9) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dusk_icon_bg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dusk_icon_fg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/dusk_icon_mg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/friendship_overlay.png` (15x14) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/github_icon.png` (13x12) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_egg_move.png` (10x10) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_lock.png` (12x13) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_owned.png` (7x7) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_spliced.png` (12x14) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_stop.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/icon_tera.png` (12x15) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/language_icon.png` (23x23) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/link_icon.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/mmenu_sel.png` (74x16) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/namebox.png` (100x20) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/night_icon_bg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/night_icon_fg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/night_icon_mg.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/overlay_exp.png` (85x2) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/overlay_hp.png` (48x6) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/overlay_hp_boss.png` (86x12) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/overlay_message.png` (512x96) -> 57 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_bg.png` (320x180) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_bg_double.png` (320x180) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_bg_double_manage.png` (320x180) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_cancel.png` (52x32) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_discard.png` (75x50) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_exp_bar.png` (34x14) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_pb.png` (20x46) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot.png` (175x144) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot_hp_bar.png` (100x7) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot_hp_overlay.png` (80x9) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot_main.png` (110x294) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot_main_short.png` (110x246) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_slot_overlay_hp.png` (80x9) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/party_transfer.png` (75x50) -> 10 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_boss.png` (178x31) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_boss_stats.png` (178x31) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_mini.png` (130x31) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_mini_stats.png` (130x31) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_type.png` (20x460) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_type1.png` (20x240) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_enemy_type2.png` (20x240) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player.png` (130x42) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_mini.png` (130x42) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_mini_stats.png` (130x42) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_stats.png` (130x42) -> 9 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_type.png` (20x460) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_type1.png` (20x240) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_player_type2.png` (20x240) -> 0 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pbinfo_stat_numbers.png` (118x8) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pb_tray_overlay_enemy.png` (104x4) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/pb_tray_overlay_player.png` (104x4) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/prompt.png` (7x25) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/reddit_icon.png` (13x12) -> 1 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/saving_icon.png` (16x16) -> 4 pieces/frames
- `pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui/scroll_bar.png` (5x155) -> 0 pieces/frames
- ... plus 140 more; see `ui-map.json` for the full extracted list.

## Ignored Or Deferred

- 223: candidate matched scan but not high-value UI extraction keyword
- 77: extraction cap reached; listed for later manual pass

The atlas stores an `ignoredSample` with representative paths. Most ignored candidates were deferred because they matched broad UI scan rules but did not match high-value extraction keywords, or because the extraction cap was reached.

## Practical Findings

- `images/ui/` contains the strongest reusable HUD assets: HP/EXP overlays, party panels, prompt/name boxes, cursors, selectors, scroll widgets, and menu selection strips.
- Several files are better treated as fixed HUD sprites than true nine-slice panels; use the extracted corners/edges as inspection material before integrating.
- Cursor assets include forward and reverse variants, useful for keyboard-only menu selection.
- The extraction is intentionally conservative and does not wire any asset into BrainRogue yet.
