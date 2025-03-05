/** External Dependencies */
import { useMemo, useCallback } from 'react';

/** Internal Dependencies */
import { SELECT_ANNOTATION } from 'actions';
import { TOOLS_IDS, TABS_IDS, WATERMARK_ANNOTATION_ID } from 'utils/constants';
import isDrawTool from 'utils/isDrawTool';
import useStore from './useStore';
import useSetAnnotation from './useSetAnnotation';

const useAnnotationEvents = () => {
  const {
    tabId,
    toolId,
    dispatch,
    config: { keepAnnotationEventsEnabled = false },
  } = useStore();
  const setAnnotation = useSetAnnotation();

  const isAnnotationEventsDisabled = useMemo(
    () =>
      !keepAnnotationEventsEnabled &&
      tabId !== TABS_IDS.ANNOTATE &&
      tabId !== TABS_IDS.WATERMARK &&
      !isDrawTool(toolId),
    [tabId, toolId],
  );

  const updatePositionOnDragEnd = useCallback((e) => {
    const newPosition = {
      id: e.target.id(),
      x: e.target.x(),
      y: e.target.y(),
    };

    setAnnotation(newPosition);
  }, []);

  const getAnnotationTransformProps = useCallback((e) => {
    const transformProps = {
      id: e.target.id(),
      rotation: e.target.rotation(),
      x: e.target.x(),
      y: e.target.y(),
    };

    if (
      e.target.name() === TOOLS_IDS.TEXT ||
      e.target.name() === TOOLS_IDS.IMAGE
    ) {
      transformProps.width = e.target.width() * e.target.scaleX();
      transformProps.height = e.target.height() * e.target.scaleY();
      transformProps.scaleX = 1;
      transformProps.scaleY = 1;
    } else {
      transformProps.scaleX = e.target.scaleX();
      transformProps.scaleY = e.target.scaleY();
    }

    return transformProps;
  }, []);

  const updateAnnotationTransform = useCallback((e) => {
    setAnnotation(getAnnotationTransformProps(e));
  }, []);

  const updateTextAndImageAnnotationOnTransform = useCallback((e) => {
    if (
      e.target.name() === TOOLS_IDS.TEXT ||
      e.target.name() === TOOLS_IDS.IMAGE
    ) {
      e.target.setAttrs(getAnnotationTransformProps(e));
    }
  });

  const selectAnnotationOnClick = useCallback((e) => {
    if (
      e.target.id() === WATERMARK_ANNOTATION_ID ||
      e.target.getStage().attrs.isDrawing
    ) {
      return;
    }

    const multiple = e.evt.ctrlKey || e.evt.shiftKey || e.evt.metaKey;
    dispatch({
      type: SELECT_ANNOTATION,
      payload: {
        annotationId: e.target.id(),
        toolId: e.target.name(),
        multiple,
      },
    });
  }, []);

  return useMemo(
    () =>
      isAnnotationEventsDisabled
        ? {}
        : {
            onTransform: updateTextAndImageAnnotationOnTransform,
            onTransformEnd: updateAnnotationTransform,
            onDragEnd: updatePositionOnDragEnd,
            onClick: selectAnnotationOnClick,
            onTap: selectAnnotationOnClick,
          },
    [isAnnotationEventsDisabled],
  );
};

export default useAnnotationEvents;
