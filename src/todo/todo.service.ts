import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { TodoDto } from './models/todo.dto';
import { ITodo } from './models/todo.interface';
import { Todo } from './models/todo.model';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<ITodo>,
  ) {}

  getAllTodos(): Observable<ITodo[]> {
    return from(this.todoRepository.find({ relations: ['category'] }));
  }

  getTodoById(id: number): Observable<ITodo> {
    return from(
      this.todoRepository.findOne({
        where: { id: id },
        relations: ['category'],
      }),
    );
  }

  getTodosByCategory(category: string): Observable<ITodo[]> {
    // return from(
    //   this.todoRepository.findBy({
    //     category: category, // Неизвестная ошибка, возможно нужно дописать/переписать соединение
    //   }),
    // );
    return from(
      this.todoRepository.query(
        `select * from todo where todo.category = '${category}'`,
      ),
    );
  }

  createTodo(todoDto: TodoDto): Observable<ITodo> {
    return from(this.todoRepository.save(this.todoRepository.create(todoDto)));
  }

  updateTodo(todoData: ITodo): Observable<ITodo> {
    this.todoRepository.update({ id: todoData.id }, todoData);
    return this.getTodoById(todoData.id);
  }

  deleteTodo(id: number): Observable<Boolean> {
    return from(this.todoRepository.delete({ id: id })).pipe(
      map((result) => {
        if (result.affected !== null) return true;
        else return false;
      }),
    );
  }
}
