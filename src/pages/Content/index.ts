import runApp from './modules';
import './content.styles.css';
import { Options } from './modules/types';

const rightSide = document.getElementById('right-side');

function createSidebar(
  container: HTMLElement,
  observer?: MutationObserver
): void {
  observer?.disconnect();
  chrome.storage.sync.get(
    [
      'startDate',
      'period',
      'startHour',
      'startMinutes',
      'sidebar',
      'dash_courses',
    ],
    function (result) {
      chrome.storage.sync.set(
        {
          startDate: !result.startDate ? 1 : result.startDate,
          startHour: !result.startHour ? 15 : result.startHour,
          startMinutes: !result.startMinutes ? 0 : result.startMinutes,
          period: !(
            result.period === 'Day' ||
            result.period === 'Week' ||
            result.period === 'Month'
          )
            ? 'Week'
            : result.period,
          sidebar:
            result.sidebar !== false && result.sidebar !== true
              ? false
              : result.sidebar,
          dash_courses:
            result.dash_courses !== false && result.dash_courses !== true
              ? false
              : result.dash_courses,
        },
        function () {
          chrome.storage.sync.get(null, function (result2) {
            const data = result2 as Options;
            /*
            insert new div at top of sidebar to hold content
          */
            const newContainer = document.createElement('div');
            (container.parentNode as Node).insertBefore(
              newContainer,
              container
            );
            /*
            only visually hide sidebar to prevent issues with DOM modification
          */
            if (!result2.sidebar) {
              (document.getElementById(
                'right-side'
              ) as HTMLElement).className += 'hidden-sidebar';
            }
            runApp(newContainer, data);
          });
        }
      );
    }
  );
}

if (rightSide) {
  /*
  in case the element is already there and not caught by mutation observer
*/
  const containerList = document.getElementsByClassName(
    'Sidebar__TodoListContainer'
  );
  const teacherContainerList = document.getElementsByClassName(
    'todo-list-header'
  );
  /*
  mutation observer waits for sidebar to load then injects content
  */
  const observer = new MutationObserver(() => {
    const todoListContainers = rightSide?.getElementsByClassName(
      'Sidebar__TodoListContainer'
    );
    const teacherTodoListContainers = rightSide?.getElementsByClassName(
      'todo-list-header'
    );
    if (todoListContainers?.length)
      createSidebar(todoListContainers[0] as HTMLElement, observer);
    else if (teacherTodoListContainers?.length)
      createSidebar(teacherTodoListContainers[0] as HTMLElement, observer);
  });

  if (containerList.length > 0) createSidebar(containerList[0] as HTMLElement);
  else if (teacherContainerList.length > 0)
    createSidebar(teacherContainerList[0] as HTMLElement);
  else if (rightSide)
    observer.observe(rightSide as Node, {
      childList: true,
    });
}