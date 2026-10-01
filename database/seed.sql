USE casefile_db;

INSERT INTO users (full_name, username, email, password_hash, `rank`, xp, cases_attempted, cases_solved)
VALUES (
    'Detective',
    'detective_demo',
    'demo@casefile.local',
    '$2b$12$Wn3cq.hblgFjm22i7RqAouhs7sFGEjKs/ahIjM4MIwZPcO2GY0WI.',
    'Rookie',
    150,
    3,
    1
);

INSERT INTO cases (case_number, title, description, difficulty, location, incident_date, incident_time, victim_name, crime_type, briefing, known_facts, witness_availability, clue_count, suspect_count, status)
VALUES
('CASE 001', 'The Missing Necklace', 'Meena\'s gold necklace went missing during a small family function.', 'Easy', 'Meena\'s House, Trichy, Tamil Nadu', '2026-02-15', '7:30 PM', 'Meena', 'Theft', 'Meena lives in Trichy. Before a small family function, she puts her gold necklace in her bedroom. The bedroom door is not locked. Divya, Kumar, and Ravi are near the house that evening. The backyard is wet because the plants were watered. After the function, Meena finds that her necklace is missing.', 'Meena put the necklace in her bedroom.\nThe bedroom door was not locked.\nThe backyard was wet because the plants were watered.\nThe necklace was missing after the function.', 'Available', 4, 3, 'open'),
('CASE 002', 'Silence at Ooty Lake', 'A violinist vanishes after a private rehearsal at a heritage estate near Ooty Lake and is later found beside the lake.', 'Easy', 'Heritage estate near Ooty Lake, Ooty, Nilgiris', '2026-03-02', '20:05', 'Karthik', 'Disappearance and murder', 'Karthik was last seen in the estate music room. Witnesses report heavy rain and a single scream near Ooty Lake.', 'The victim carried a silver watch and a torn sleeve from an expensive coat.', 'Available', 5, 3, 'open'),
('CASE 003', 'The Missing Ledger', 'A banker disappears while carrying a ledger of embezzlement records from a finance office in George Town, linked to a leak from the Chennai city council at Ripon Building.', 'Moderate', 'Finance Office, George Town, Chennai', '2026-04-18', '18:20', 'Kavya', 'Kidnapping and murder', 'Funds were missing from the city ledger and Kavya had access to the final account book at the George Town finance office before vanishing.', 'The victim was seen entering the finance office archive stairwell with a black briefcase.', 'Limited', 6, 4, 'open'),
('CASE 004', 'Echoes in Room 407', 'The owner of a fictional heritage hotel near Marina Beach, Chennai, is killed in a room that was supposedly vacant, leaving a trail of false alibis.', 'Moderate', 'Fictional heritage hotel near Marina Beach, Chennai', '2026-05-27', '01:15', 'Ravi', 'Murder', 'Ravi was found in Room 407 after midnight. The room was locked and the hotel hallway camera showed a figure in a broad coat.', 'A hotel key card was never activated and a brass cufflink was recovered from the bath.', 'Available', 7, 4, 'open'),
('CASE 005', 'The Last Train', 'A railway auditor is found dead aboard a commuter train halted on its route from Chennai Egmore Railway Station toward Perambur Railway Yard, with a sealed compartment and manipulated evidence.', 'Hard', 'Chennai Egmore Railway Station', '2026-06-11', '22:15', 'Arjun', 'Murder', 'Arjun was discovered in the last carriage after the train left Chennai Egmore for its night layover at Perambur Railway Yard. The train stopped under a blackout and all doors were sealed.', 'The victim had purchased a return ticket under an alias at Chennai Egmore, and a ledger page was hidden in his boot.', 'Available', 8, 5, 'open');

INSERT INTO victims (case_id, name, age, occupation, summary)
VALUES
(1, 'Meena', 42, 'Homeowner', 'Meena owns the gold necklace.'),
(2, 'Karthik', 35, 'Violinist', 'A celebrated musician who was preparing for a private recital.'),
(3, 'Kavya', 47, 'Banker', 'An accountant whose ledger exposed suspicious transfers.'),
(4, 'Ravi', 58, 'Hotel owner', 'A stern business owner with a long list of rival tenants.'),
(5, 'Arjun', 51, 'Rail auditor', 'A meticulous auditor who tracked stolen assets across public lines.');

INSERT INTO suspects (case_id, name, age, occupation, relationship_to_victim, possible_motive, alibi, known_information, is_culprit)
VALUES
(1, 'Divya', 31, 'Relative', 'Cousin', 'She wanted to wear the necklace at the function.', 'She says she stayed with the guests in the front room.', 'Selvi saw Divya in the front room.', FALSE),
(1, 'Kumar', 44, 'Neighbor', 'Neighbor', 'He needed money to pay a bill.', 'He says he stayed by the front gate and never entered the house.', 'He helped water the plants.', TRUE),
(1, 'Ravi', 39, 'Family friend', 'Family friend', 'He had asked Meena to lend him money.', 'He says he stayed by the front gate.', 'Balu saw Ravi at the front gate.', FALSE),
(2, 'Vijay', 28, 'Assistant', 'Friend', 'He wanted access to the estate funds for a failed business.', 'Vijay said he was practicing in the heritage estate west hall.', 'He had a torn sleeve matching the Ooty Lake scene.', FALSE),
(2, 'Anitha', 52, 'Housekeeper', 'Employee', 'She feared dismissal after the victim discovered theft.', 'Anitha claimed she was checking the estate pantry.', 'She knew the back stair path from the estate to the Ooty Lake gate.', TRUE),
(2, 'Prakash', 45, 'Gardener', 'Neighbor', 'He believed the victim had sabotaged his greenhouse licensing.', 'Prakash was at the estate garden gate facing Ooty Lake with a lantern at 20:15.', 'He owns boots with a distinctive tread.', FALSE),
(3, 'Harini', 36, 'Policy analyst', 'Former colleague', 'She had been cut from a grant and wanted the ledger concealed.', 'Harini was at a council hearing in Ripon Building until 18:40.', 'She owns a black briefcase with a damaged latch.', FALSE),
(3, 'Dinesh', 51, 'Security chief', 'Supervisor', 'He feared a fraudulent audit would expose his division.', 'Dinesh was on a secure call until 18:35.', 'He had access to restricted stairwell keys.', TRUE),
(3, 'Priya', 29, 'Courier', 'Friend', 'She needed funds to settle a debt to a private collector.', 'Priya was delivering packages at 18:10.', 'She admitted to visiting the George Town finance office wing earlier that day.', FALSE),
(3, 'Mohan', 41, 'Accountant', 'Business rival', 'He stood to lose a partnership if the ledger surfaced.', 'Mohan remained in his office near the finance office front atrium.', 'His signature is on the forged transfer note.', FALSE),
(4, 'Lakshmi', 30, 'Event planner', 'Daughter of victim', 'She stood to inherit the hotel after a disputed sale.', 'Lakshmi was in the hotel ballroom with staff.', 'She knew the hotel room layouts and kept a copy of the old floor plans.', FALSE),
(4, 'Selvam', 46, 'Bell captain', 'Employee', 'He feared the victim would replace him with a younger manager.', 'Selvam was on regular rounds until 00:50.', 'He had access to guest keys and a broken cufflink matching the scene.', TRUE),
(4, 'Revathi', 54, 'Housekeeper', 'Former employee', 'She believed Ravi had ruined her pension.', 'Revathi was in the hotel laundry room with two staff members.', 'She mentioned hearing a quarrel near Room 407.', FALSE),
(5, 'Deepa', 37, 'Ticket inspector', 'Former partner', 'She needed the ledger to hide a network of falsified transfers.', 'Deepa was checking the Chennai Egmore platform booth until 22:30.', 'She had a schedule showing the train layover at Perambur Railway Yard.', FALSE),
(5, 'Kumar', 49, 'Freight handler', 'Rival', 'He feared the victim would expose his illicit cargo shipments.', 'Kumar claimed he was at the loading bay at Perambur Railway Yard.', 'He wore heavy gloves that left soot marks on the carriage handle.', TRUE),
(5, 'Janani', 33, 'Journalist', 'Acquaintance', 'She wanted to expose a public funds scheme linked to the audit.', 'Janani was making notes in the café car on the train from Chennai Egmore.', 'Her notebook contains a question about the missing ledger page.', FALSE);

INSERT INTO witnesses (case_id, name, age, occupation, relationship_to_victim, location, interview_status, reliability, statement)
VALUES
(1, 'Selvi', 44, 'Guest', 'Family friend', 'Front room', 'pending', 'truthful', 'Divya stayed with the guests in the front room.'),
(1, 'Balu', 38, 'Neighbor', 'Neighbor', 'Front gate', 'pending', 'truthful', 'Ravi stayed by the front gate while I spoke with him.'),
(1, 'Mani', 50, 'Gardener', 'Neighbor', 'Backyard', 'pending', 'truthful', 'I saw Kumar walk into the backyard around 7:00.'),
(2, 'Aishwarya', 40, 'House manager', 'Employee', 'Estate solarium near Ooty Lake', 'pending', 'truthful', 'Ooty Lake was glimmering under the rain, and I heard a cry from behind the estate hedge toward the water.'),
(2, 'Saravanan', 63, 'Retired teacher', 'Neighbor', 'Estate garden gate by Ooty Lake', 'pending', 'biased', 'I saw a woman in a dark coat leaving the estate west hall, but it might have been the housekeeper.'),
(3, 'Gokul', 54, 'Courier', 'Acquaintance', 'George Town finance office atrium', 'pending', 'truthful', 'The finance office stairwell smelled like oil and there was a fresh scuff on the wall near the archive door.'),
(3, 'Swetha', 46, 'Council clerk', 'Former associate', 'Ripon Building, Chennai', 'pending', 'misleading', 'I never saw Kavya at Ripon Building after 18:20. She was always late to meetings, so I am not sure.'),
(4, 'Senthil', 29, 'Concierge', 'Employee', 'Fictional Marina Beach heritage hotel lobby', 'pending', 'partial', 'I saw a guest in a broad coat leaving through the hotel service stair after 1:00 a.m.'),
(4, 'Ramya', 62, 'Guest', 'Stranger', 'Fictional Marina Beach heritage hotel, Room 514', 'pending', 'truthful', 'I heard a raised voice from Room 407 and the clink of metal on porcelain.'),
(5, 'Vignesh', 52, 'Stationmaster', 'Coworker', 'Chennai Egmore Railway Station, Platform 4', 'pending', 'truthful', 'The final train from Chennai Egmore toward Perambur Railway Yard stopped under blackout conditions, and the last carriage was silent for fifteen minutes.'),
(5, 'Keerthi', 38, 'Commuter', 'Passenger', 'Chennai Egmore platform bridge', 'pending', 'partial', 'I remember a man in heavy gloves near the last carriage on the train bound for Perambur Railway Yard, but I could not see his face.'),
(5, 'Murali', 57, 'Mechanic', 'Contractor', 'Perambur Railway Yard', 'pending', 'biased', 'A station inspector was the only one working near the carriage at Perambur Railway Yard that night, though I cannot say more.' );

INSERT INTO clues (case_id, name, description, clue_type, location, importance, discovery_condition, is_hidden)
VALUES
(1, 'Wet Footprints', 'Wet footprints lead from the backyard toward Meena\'s bedroom.', 'Physical', 'Backyard path to bedroom', 'High', 'visible', FALSE),
(1, 'Wet Kitchen Floor', 'The kitchen floor and a towel by the sink are wet. Someone may have washed their feet there.', 'Physical', 'Kitchen', 'Medium', 'visible', FALSE),
(1, 'Missing Spare Key', 'The spare bedroom key is missing from its hook near the kitchen.', 'Key', 'Kitchen key hook', 'High', 'visible', FALSE),
(1, 'Kumar\'s Statement', 'Kumar says, \'I never went inside Meena\'s house.\'', 'Statement', 'Meena\'s House', 'High', 'visible', FALSE),
(2, 'Black Feather', 'A single black feather found near the Ooty Lake path.', 'Physical', 'Ooty Lake trail', 'Medium', 'visible', FALSE),
(2, 'Rain-Slick Shoe Print', 'A deep shoe impression shaped like a narrow heel.', 'Physical', 'Ooty Lake edge', 'High', 'visible', FALSE),
(2, 'Broken Brooch', 'A silver brooch with a cracked enamel edge.', 'Physical', 'Heritage estate gardens near Ooty Lake', 'Medium', 'hidden', TRUE),
(2, 'Housekeeper Key Ring', 'A ring with a brass key matching the estate garden gate by Ooty Lake.', 'Physical', 'Heritage estate pantry near Ooty Lake', 'High', 'visible', FALSE),
(3, 'Stairwell Scuff', 'A dark scrape on the George Town finance office stairwell wall and fresh oil smear.', 'Physical', 'Finance Office, George Town, north stairwell', 'High', 'visible', FALSE),
(3, 'Forged Ledger Note', 'A false transfer note with the suspect signature and a duplicate seal.', 'Document', 'Finance Office, George Town archive', 'High', 'hidden', TRUE),
(3, 'Leather Briefcase', 'A briefcase with a damaged latch and a faint blood smear.', 'Physical', 'Finance Office, George Town archive vault', 'High', 'visible', FALSE),
(3, 'Security Keycard', 'An access card used after hours near the restricted stairwell.', 'Physical', 'Finance Office, George Town security desk', 'Medium', 'visible', FALSE),
(4, 'Cufflink', 'A matching brass cufflink found in the hotel bath.', 'Physical', 'Fictional Marina Beach heritage hotel, Room 407', 'High', 'visible', FALSE),
(4, 'Service Stair Camera', 'A still image showing a broad coat shadow descending the hotel service stairs.', 'Evidence', 'Fictional Marina Beach heritage hotel security office', 'High', 'visible', FALSE),
(4, 'Pill Bottle', 'An empty bottle with a sleeping agent residue near the bedside.', 'Physical', 'Fictional Marina Beach heritage hotel, Room 407', 'High', 'hidden', TRUE),
(4, 'Room Plan', 'A marked floor plan of the fictional Chennai heritage hotel that omits Room 407.', 'Document', 'Fictional Marina Beach heritage hotel manager desk', 'Medium', 'visible', FALSE),
(5, 'Ticket Stub', 'A return ticket bought under an alias at Chennai Egmore with the final train marked.', 'Document', 'Chennai Egmore train, Seat 12', 'High', 'visible', FALSE),
(5, 'Ledger Page', 'A missing ledger page hidden inside a boot heel in the last carriage bound for Perambur Railway Yard.', 'Document', 'Train last carriage, Chennai Egmore to Perambur Railway Yard', 'High', 'hidden', TRUE),
(5, 'Sooted Handle', 'A carriage handle stained with soot and damp grime on the train bound for Perambur Railway Yard.', 'Physical', 'Train last carriage, Chennai Egmore to Perambur Railway Yard', 'High', 'visible', FALSE),
(5, 'Blackout Log', 'A log indicating emergency blackout during the final stop before the Perambur Railway Yard layover.', 'Document', 'Chennai Egmore signal room', 'High', 'visible', FALSE),
(5, 'Heavy Gloves', 'Gloves with soot residue from a transfer at Perambur Railway Yard.', 'Physical', 'Perambur Railway Yard maintenance locker', 'Medium', 'visible', FALSE);

INSERT INTO evidence (case_id, name, description, evidence_type, location, related_info)
VALUES
(1, 'Wet Footprint Mark', 'A clear wet mark is on the path from the backyard toward the bedroom.', 'Footprint', 'Backyard path', 'The mark follows the wet footprints toward the bedroom.'),
(1, 'Spare Bedroom Key', 'The missing key from Meena\'s kitchen is found in Kumar\'s pocket.', 'Key', 'Kumar\'s pocket', 'The key links Kumar to the house. The bedroom door was not locked, so the key was not needed to open it.'),
(2, 'Silver Watch', 'Karthik''s watch with the crystal cracked.', 'Personal Item', 'Ooty Lake shore', 'The watch was found near the Ooty Lake edge.'),
(2, 'Garden Gate Key', 'A gate key with visible wear from repeated use.', 'Key', 'Heritage estate pantry near Ooty Lake', 'Matches the route from the estate to Ooty Lake.'),
(3, 'False Transfer', 'A forged transfer note tied to a restricted board in the George Town finance office.', 'Document', 'Finance Office, George Town archive', 'It appears signed by the accused internal security chief.'),
(3, 'Oil Drag', 'A drag of machine oil from the finance office stairwell wall.', 'Trace', 'Finance Office, George Town north stairwell', 'The oil matches a maintenance cart used by the suspect.'),
(4, 'Broad Coat Fibers', 'Fibers from a heavy wool coat found in the bath drain.', 'Trace', 'Fictional Marina Beach heritage hotel, Room 407 bath', 'Fibers match the custodian uniform and tenant coats.'),
(4, 'Pill Residue', 'Residue from a sedative mixed into the guest drink.', 'Chemical', 'Fictional Marina Beach heritage hotel bedside table', 'The sedative was hidden in the hotel room-service tray.'),
(5, 'Alias Ticket', 'Ticket purchased under an alias that matches Chennai Egmore station records.', 'Document', 'Chennai Egmore train, Seat 12', 'The alias matches a ledger lead connected to the suspect.'),
(5, 'Rail Sarcophagus Log', 'A log from the Perambur Railway Yard freight office showing an emergency stop on the route from Chennai Egmore.', 'Document', 'Chennai Egmore signal room', 'It confirms the blackout and delayed discovery window.');

INSERT INTO timeline_events (case_id, event_time, title, description)
VALUES
(1, '6:00 PM', 'Guests arrive', 'Guests arrive for the family function.'),
(1, '6:30 PM', 'Necklace put away', 'Meena puts the necklace in her bedroom.'),
(1, '7:00 PM', 'Kumar goes to backyard', 'The function is still going on. Mani sees Kumar go toward the backyard.'),
(1, '7:30 PM', 'Necklace missing', 'Meena notices the necklace is missing.'),
(2, '18:30', 'Rehearsal starts', 'Karthik begins a private rehearsal in the heritage estate music room near Ooty Lake.'),
(2, '19:45', 'Witness hears cry', 'A scream is reported near the Ooty Lake-side estate hedge and garden gate.'),
(2, '20:05', 'Disappearance noted', 'Milo is reported missing after the storm had passed.'),
(2, '20:30', 'Lake search', 'The body is found beside the Ooty Lake path with a torn sleeve.'),
(3, '17:40', 'Briefcase checked', 'Kavya enters the George Town finance office north stairwell carrying a briefcase.'),
(3, '18:15', 'Council email sent', 'A transfer note is sent from the George Town finance office archive to Ripon Building.'),
(3, '18:20', 'Disappearance', 'Witnesses lose sight of Kavya on the finance office north stairwell.'),
(3, '19:00', 'Security alert', 'The George Town finance office file room is sealed and the ledger is marked missing.'),
(4, '00:10', 'Room access', 'A guest keycard is used to access Room 407.'),
(4, '00:35', 'Guest complaint', 'A guest reports a loud argument and the sound of glass chime.'),
(4, '01:15', 'Body discovered', 'Ravi is found facing the bath with a sedative residue by the bed.'),
(4, '01:40', 'Service stair camera review', 'Security at the fictional Marina Beach heritage hotel reviews the service-stair camera and notices the broad-coat figure.'),
(5, '21:20', 'Ticket purchase', 'Arjun purchases a ticket under an alias at the Chennai Egmore station kiosk.'),
(5, '22:00', 'Train departs', 'The final train leaves Chennai Egmore for its night layover at Perambur Railway Yard under a blackout alert.'),
(5, '22:15', 'Blackout triggered', 'On the route to Perambur Railway Yard, the train stops and all power is cut to the final carriage.'),
(5, '22:30', 'Body found', 'Arjun is discovered in the last carriage on the Perambur-bound train with soot on the handle.'),
(5, '23:00', 'Emergency briefing', 'Officials review Chennai Egmore platform footage and the Perambur Railway Yard emergency logs.');

INSERT INTO investigations (user_id, case_id, status, score, xp, current_stage)
VALUES (1, 1, 'active', 0, 0, 'briefing'),
(1, 2, 'completed', 720, 72, 'result');

INSERT INTO discovered_clues (investigation_id, clue_id)
VALUES (2, 5), (2, 7), (2, 6);

INSERT INTO collected_evidence (investigation_id, evidence_id)
VALUES (2, 3), (2, 4);

INSERT INTO witness_interviews (investigation_id, witness_id, question, answer)
VALUES (2, 5, 'What did you see?', 'I saw a dark coat near the heritage estate west hall by Ooty Lake after the storm.');

INSERT INTO deductions (investigation_id, item_a, item_b, reasoning)
VALUES (2, 'Ooty Lake trail', 'Anitha', 'The housekeeper knew the estate route to Ooty Lake, and the mud pattern confirms a direct exit path.');

INSERT INTO accusations (investigation_id, culprit, motive, method, evidence, explanation, correct)
VALUES (2, 'Anitha', 'She feared dismissal and feared exposure', 'Poisoning', 'Housekeeper Key Ring', 'She was the one with direct access to the estate gate by Ooty Lake and the hidden key.', TRUE);

INSERT INTO case_results (investigation_id, solved, score, xp, accuracy, feedback, correct_clues, correct_deductions)
VALUES (2, TRUE, 720, 72, 100.0, 'Case solved by identifying the direct killer and chain of evidence.', 3, 1);

INSERT INTO user_statistics (user_id, total_investigations, cases_solved, cases_failed, average_score, total_xp, current_rank)
VALUES (1, 2, 1, 1, 360.0, 222, 'Rookie');
