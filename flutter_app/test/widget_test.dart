import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hello_flutter/main.dart';

void main() {
  testWidgets('Shows a greeting and responds to repeated taps', (tester) async {
    await tester.pumpWidget(const HelloApp());
    expect(find.text('Hello, World!'), findsOneWidget);
    expect(find.text('Tap the button to say hello.'), findsOneWidget);

    await tester.tap(find.widgetWithText(FilledButton, 'Say hello'));
    await tester.pump();
    expect(find.text('You said hello 1 time!'), findsOneWidget);

    await tester.tap(find.widgetWithText(FilledButton, 'Say hello'));
    await tester.pump();
    expect(find.text('You said hello 2 times!'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Greeting remains usable on a small screen with large text', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 480);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: const HelloPage(),
        ),
      ),
    );
    final button = find.widgetWithText(FilledButton, 'Say hello');
    await tester.ensureVisible(button);
    await tester.tap(button);
    await tester.pump();
    expect(find.text('You said hello 1 time!'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
