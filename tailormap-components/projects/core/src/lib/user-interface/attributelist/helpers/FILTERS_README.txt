wegvak - 1
	wegvakonderdeel - 2
		wegvakonderdeelplanning - 3
		wegvakonderdeelinspectie - 4
	wegvakinspectie - 5
	wegvakplanning - 6


Filter op wegvakonderdeelplanning - datum = 123

wegvak - RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123))))
	wegvakonderdeel - RELATED_FEATURE(2, 3, (datum = 123))
		wegvakonderdeelplanning - datum = 123
		wegvakonderdeelinspectie - RELATED_FEATURE(4, 2, RELATED_FEATURE(2, 3, (datum = 123)))
	wegvakinspectie - RELATED_FEATURE(5, 1, RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123)))))
	wegvakplanning - RELATED_FEATURE(6, 1, RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123)))))

Filter op wegvakonderdeelplanning - datum = 123, wegvakinspectie - aap = pietje

wegvak - 	RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123))))
			RELATED_FEATURE(1, 5, (aap = pietje))

	wegvakonderdeel - 	RELATED_FEATURE(2, 3, (datum = 123)) AND
						RELATED(2, 1, RELATED_FEATURE(1, 5, (aap = pietje)))

		wegvakonderdeelplanning - 	datum = 123
									RELATED(3, 1, RELATED_FEATURE(1, 5, (aap = pietje)))

		wegvakonderdeelinspectie - 	RELATED_FEATURE(4, 2, RELATED_FEATURE(2, 3, (datum = 123)))
									RELATED(4, 1, RELATED_FEATURE(1, 5, (aap = pietje)))

	wegvakinspectie - 	RELATED_FEATURE(5, 1, RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123)))))
						aap = pietje

	wegvakplanning - 	RELATED_FEATURE(6, 1, RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (datum = 123)))) AND RELATED_FEATURE(1, 5, (aap = pietje)))