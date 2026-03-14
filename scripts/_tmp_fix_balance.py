import json, os, math

file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'scenarios.json')

with open(file_path, 'r', encoding='utf-8') as f:
    scenarios = json.load(f)

DELTA_FIELDS = [
    'wealthDelta', 'controlDelta', 'influenceDelta', 'resilienceDelta',
    'allianceDelta', 'stratificationDelta', 'productionDelta', 'innovationDelta',
    'welfareDelta', 'democracyDelta'
]

roles = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup']
cap_count = 0
trade_off_count = 0
alliance_reduce_count = 0

# === TASK 1: Cap all deltas at ±15 ===
for scenario in scenarios:
    for role in roles:
        choices = scenario['roleSpecificChoices'][role]
        for choice in choices:
            for field in DELTA_FIELDS:
                val = choice['effects'][field]
                if val > 15:
                    print(f"[CAP] {scenario['id']} / {role} / {choice['id']}: {field} {val} → 15")
                    choice['effects'][field] = 15
                    cap_count += 1
                elif val < -15:
                    print(f"[CAP] {scenario['id']} / {role} / {choice['id']}: {field} {val} → -15")
                    choice['effects'][field] = -15
                    cap_count += 1

# === TASK 2: Dialectical trade-offs for Choice B ===
trade_offs = {
    'tu-dong-hoa': {
        'cong-nhan': {'productionDelta': -9},
        'nong-dan': {'productionDelta': -8},
    },
    'dinh-cong-gig': {
        'cong-nhan': {'productionDelta': -8},
    },
    'bang-sang-che': {
        'startup': {'innovationDelta': -4},
    },
    'mua-lai-startup': {
        'tri-thuc': {'innovationDelta': -6},
        'startup': {'innovationDelta': -7},
    },
    'blockchain-tu-quan': {
        'cong-nhan': {'productionDelta': -5},
        'nong-dan': {'productionDelta': -5},
        'tri-thuc': {'productionDelta': -5},
        'startup': {'productionDelta': -5},
    },
    'san-xuat-xanh': {
        'startup': {'productionDelta': -9},
    },
    'chia-se-nen-tang': {
        'startup': {'innovationDelta': -6},
    },
    'lien-doan-lao-dong-so': {
        'startup': {'productionDelta': -6},
    },
}

for scenario in scenarios:
    scenario_trade_offs = trade_offs.get(scenario['id'])
    if not scenario_trade_offs:
        continue
    for role, deltas in scenario_trade_offs.items():
        choice_b = next((c for c in scenario['roleSpecificChoices'][role] if c['id'] == 'B'), None)
        if not choice_b:
            print(f"[ERROR] No choice B found for {scenario['id']} / {role}")
            continue
        for field, new_val in deltas.items():
            old_val = choice_b['effects'][field]
            print(f"[TRADE-OFF] {scenario['id']} / {role} / B: {field} {old_val} → {new_val}")
            choice_b['effects'][field] = new_val
            trade_off_count += 1

# === TASK 3: Reduce ~30% of B choices with allianceDelta >= 15 ===
high_alliance_b_choices = []
for scenario in scenarios:
    for role in roles:
        choice_b = next((c for c in scenario['roleSpecificChoices'][role] if c['id'] == 'B'), None)
        if choice_b and choice_b['effects']['allianceDelta'] >= 15:
            high_alliance_b_choices.append({'scenario': scenario, 'role': role, 'choiceB': choice_b})

print(f"\n[ALLIANCE] Found {len(high_alliance_b_choices)} B choices with allianceDelta >= 15")
target_count = round(len(high_alliance_b_choices) * 0.3)
print(f"[ALLIANCE] Will reduce ~{target_count} of them (~30%)")

reduced_values = [10, 11, 12, 13]
reduced_idx = 0
for i in range(len(high_alliance_b_choices)):
    if i % 3 == 0 and reduced_idx < target_count:
        item = high_alliance_b_choices[i]
        old_val = item['choiceB']['effects']['allianceDelta']
        new_val = reduced_values[reduced_idx % len(reduced_values)]
        print(f"[ALLIANCE] {item['scenario']['id']} / {item['role']} / B: allianceDelta {old_val} → {new_val}")
        item['choiceB']['effects']['allianceDelta'] = new_val
        alliance_reduce_count += 1
        reduced_idx += 1

# === Write output ===
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(scenarios, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('\n=== SUMMARY ===')
print(f"Task 1 (Cap ±15): {cap_count} values capped")
print(f"Task 2 (Trade-offs): {trade_off_count} values modified")
print(f"Task 3 (Alliance reduction): {alliance_reduce_count} / {len(high_alliance_b_choices)} high-alliance B choices reduced")
print(f"Output written to {file_path}")
