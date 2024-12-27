export default function toggleState(state) {
    return state.$$setState(currentState => !currentState);
}