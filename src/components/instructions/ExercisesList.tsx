{exercises.map((exercise) => (
        <div 
          key={exercise.id}
          className={`border-l-4 ${
            exercise.id === 'exercise-1-1' || exercise.id === 'exercise-1-2' ? 'border-fpt-blue' : 
            exercise.id === 'exercise-2' ? 'border-fpt-orange' : 
            exercise.id === 'exercise-3' ? 'border-fpt-green' :
            'border-fpt-blue'
          } pl-3 cursor-pointer hover:bg-gray-50`}
          onClick={() => onExerciseClick(exercise)}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">{exercise.title}</p>
            {(exercise.id === 'exercise-1-1' || exercise.id === 'exercise-1-2') && (
              <FileText className="h-4 w-4 text-fpt-blue" />
            )}
          </div>
          <p className="text-sm">
            Nhấp vào đây để xem chi tiết bài tập
          </p>
        </div>
      ))}